import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

function asIsoFromUnix(value: unknown) { return typeof value === 'number' && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null }
function normalizeSubscriptionStatus(status: string) { const allowed=new Set(['active','canceled','past_due','trialing','incomplete','incomplete_expired','unpaid','paused']); return allowed.has(status)?status:'incomplete' }

export async function POST(req: Request) {
  try {
    if (!stripeSecretKey || !webhookSecret) return NextResponse.json({ error: 'Webhook configuration missing' }, { status: 500 })
    const stripe = new Stripe(stripeSecretKey)
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')
    if (!signature) return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: processedEvent } = await adminSupabase.from('stripe_webhook_events').select('id').eq('event_id', event.id).maybeSingle()
    if (processedEvent) return NextResponse.json({ received: true })
    const recordEvent = async (extra: Record<string, unknown> = {}) => { await adminSupabase.from('stripe_webhook_events').upsert({ event_id:event.id,event_type:event.type,payload:event as any,...extra },{onConflict:'event_id',ignoreDuplicates:true}) }

    const syncSubscription = async (subscription: Stripe.Subscription, forceCanceled = false) => {
      const userId=subscription.metadata?.user_id, planId=subscription.metadata?.plan_id, planCode=subscription.metadata?.plan_code
      if(!userId||!planId||!['pro','premium'].includes(planCode||'')) throw new Error(`Subscription ${subscription.id} missing Find4Sport metadata`)
      const raw=subscription as any; const customerId=typeof subscription.customer==='string'?subscription.customer:subscription.customer?.id
      const status=forceCanceled?'canceled':normalizeSubscriptionStatus(subscription.status)
      const {error}=await adminSupabase.from('user_subscriptions').upsert({user_id:userId,plan_id:planId,tier:planCode,stripe_customer_id:customerId||null,stripe_subscription_id:subscription.id,status,current_period_start:asIsoFromUnix(raw.current_period_start),current_period_end:asIsoFromUnix(raw.current_period_end),cancel_at_period_end:Boolean(raw.cancel_at_period_end),updated_at:new Date().toISOString()},{onConflict:'user_id'})
      if(error) throw error
    }

    const persistInvoiceTransaction = async (invoice: Stripe.Invoice, status: 'completed'|'failed') => {
      const customerId=typeof invoice.customer==='string'?invoice.customer:invoice.customer?.id; if(!customerId)return
      const {data:subscriptionRow}=await adminSupabase.from('user_subscriptions').select('user_id').eq('stripe_customer_id',customerId).maybeSingle(); if(!subscriptionRow?.user_id)return
      const invoiceId=invoice.id; const {data:existing}=await adminSupabase.from('transactions').select('id').eq('stripe_charge_id',invoiceId).maybeSingle()
      const payload={user_id:subscriptionRow.user_id,amount:Number((status==='completed'?invoice.amount_paid:invoice.amount_due)||0)/100,currency:invoice.currency||'eur',type:'subscription_payment',status,stripe_charge_id:invoiceId}
      const result=existing?await adminSupabase.from('transactions').update(payload).eq('id',existing.id):await adminSupabase.from('transactions').insert(payload); if(result.error)throw result.error
    }

    if(event.type==='checkout.session.completed'){
      const session=event.data.object as Stripe.Checkout.Session
      if(session.mode==='subscription'&&session.subscription){const subscriptionId=typeof session.subscription==='string'?session.subscription:session.subscription.id; await syncSubscription(await stripe.subscriptions.retrieve(subscriptionId)); await recordEvent(); return NextResponse.json({received:true})}

      const packagePurchaseId=session.metadata?.service_package_purchase_id
      if(packagePurchaseId){
        const db=adminSupabase as any
        const {data:purchase,error:purchaseError}=await db.from('service_package_purchases').select('id,user_id,package_id,sessions_total,price_paid,status').eq('id',packagePurchaseId).maybeSingle()
        if(purchaseError||!purchase)return NextResponse.json({error:'Package purchase not found'},{status:404})
        const paidAmount=Number(session.amount_total||0)/100
        if(Number(purchase.price_paid)!==paidAmount)return NextResponse.json({error:'Package amount mismatch'},{status:400})
        if(purchase.status==='pending'){
          const {data:packageDefinition,error:packageError}=await db.from('service_packages').select('validity_days').eq('id',purchase.package_id).maybeSingle()
          if(packageError||!packageDefinition)throw new Error('Package definition not found while activating purchase')
          const purchasedAt=new Date()
          const validityDays=packageDefinition.validity_days==null?null:Number(packageDefinition.validity_days)
          const expiresAt=validityDays&&validityDays>0?new Date(purchasedAt.getTime()+validityDays*86400000).toISOString():null
          const paymentIntentId=typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id
          const {error}=await db.from('service_package_purchases').update({status:'active',sessions_remaining:Number(purchase.sessions_total),purchased_at:purchasedAt.toISOString(),expires_at:expiresAt,stripe_session_id:session.id,stripe_payment_intent_id:paymentIntentId||null,updated_at:purchasedAt.toISOString()}).eq('id',packagePurchaseId).eq('status','pending')
          if(error)throw error
          const chargeRef=paymentIntentId||session.id
          const {data:existingTx}=await adminSupabase.from('transactions').select('id').eq('stripe_charge_id',chargeRef).maybeSingle()
          if(!existingTx)await adminSupabase.from('transactions').insert({user_id:purchase.user_id,amount:paidAmount,currency:session.currency||'eur',type:'service_package_payment',status:'completed',stripe_charge_id:chargeRef})
        }
        await recordEvent({service_package_purchase_id:packagePurchaseId})
        return NextResponse.json({received:true})
      }

      const eventParticipantId=session.metadata?.event_participant_id
      if(eventParticipantId){
        const {data:participant}=await adminSupabase.from('event_participants').select('id,event_id,payment_status,status').eq('id',eventParticipantId).maybeSingle()
        if(!participant)return NextResponse.json({error:'Event participant not found'},{status:404})
        if(participant.payment_status!=='paid'){
          const {error}=await adminSupabase.from('event_participants').update({status:'confirmed',payment_status:'paid',updated_at:new Date().toISOString()}).eq('id',eventParticipantId)
          if(error)throw error
        }
        await recordEvent({event_participant_id:eventParticipantId})
        return NextResponse.json({received:true})
      }

      const reservationId=session.metadata?.reservation_id
      if(reservationId){const {data:reservation}=await adminSupabase.from('reservations').select('id,amount,payment_status').eq('id',reservationId).maybeSingle(); if(!reservation)return NextResponse.json({error:'Reservation not found'},{status:404}); if(reservation.payment_status!=='paid'){const paidAmount=(session.amount_total||0)/100; if(Number(reservation.amount)!==Number(paidAmount))return NextResponse.json({error:'Amount mismatch'},{status:400}); await adminSupabase.from('reservations').update({status:'paid',payment_status:'paid'}).eq('id',reservationId)} await recordEvent({reservation_id:reservationId}); return NextResponse.json({received:true})}
    }

    if(event.type==='customer.subscription.created'||event.type==='customer.subscription.updated'||event.type==='customer.subscription.deleted'){const subscription=event.data.object as Stripe.Subscription; await syncSubscription(subscription,event.type==='customer.subscription.deleted'); await recordEvent(); return NextResponse.json({received:true})}
    if(event.type==='invoice.paid'){await persistInvoiceTransaction(event.data.object as Stripe.Invoice,'completed'); await recordEvent(); return NextResponse.json({received:true})}
    if(event.type==='invoice.payment_failed'){const invoice=event.data.object as Stripe.Invoice; const customerId=typeof invoice.customer==='string'?invoice.customer:invoice.customer?.id; if(customerId)await adminSupabase.from('user_subscriptions').update({status:'past_due',updated_at:new Date().toISOString()}).eq('stripe_customer_id',customerId); await persistInvoiceTransaction(invoice,'failed'); await recordEvent(); return NextResponse.json({received:true})}
    await recordEvent(); return NextResponse.json({received:true})
  } catch(err:any){console.error('Webhook error:',err.message); return NextResponse.json({error:'Webhook Error'},{status:400})}
}
