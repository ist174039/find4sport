import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

function asIsoFromUnix(value: unknown) { return typeof value === 'number' && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null }
function normalizeSubscriptionStatus(status: string) { const allowed=new Set(['active','canceled','past_due','trialing','incomplete','incomplete_expired','unpaid','paused']); return allowed.has(status)?status:'incomplete' }
function cents(value: unknown) { const n=Number(value); return Number.isFinite(n)?n:0 }
function moneyFromCents(value: unknown) { return cents(value)/100 }
function missingAuditColumns(error: any) { const code=String(error?.code||''); const msg=String(error?.message||''); return ['42703','PGRST204'].includes(code)||['gross_amount','stripe_payment_intent_id','provider_net_amount','financial_metadata'].some(key=>msg.includes(key)) }

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

    const persistMarketplaceTransaction = async (session: Stripe.Checkout.Session, buyerUserId: string, sourceType: string, sourceId: string) => {
      const paymentIntentId=typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id
      if(!paymentIntentId) throw new Error(`Checkout ${session.id} has no payment intent`)
      const paymentIntent=await stripe.paymentIntents.retrieve(paymentIntentId,{expand:['latest_charge.balance_transaction']})
      const pi:any=paymentIntent
      const charge:any=typeof pi.latest_charge==='object'?pi.latest_charge:null
      const balance:any=charge&&typeof charge.balance_transaction==='object'?charge.balance_transaction:null
      const metadata={...(session.metadata||{}),...(paymentIntent.metadata||{})}
      const baseCents=cents(metadata.base_amount_cents)
      const customerFeeCents=cents(metadata.customer_fee_cents)
      const commissionCents=cents(metadata.platform_commission_cents)
      const applicationFeeCents=cents(metadata.application_fee_cents)
      const grossCents=cents(session.amount_total)
      const stripeFeeCents=cents(balance?.fee)
      const providerNetCents=Math.max(0,baseCents-commissionCents)
      const platformNetCents=applicationFeeCents-stripeFeeCents
      const chargeId=charge?.id||paymentIntentId
      const providerUserId=metadata.provider_user_id||null
      const connectedAccountId=metadata.connected_account_id||null
      const transferId=typeof charge?.transfer==='string'?charge.transfer:charge?.transfer?.id||null
      const txType=`${sourceType}_payment`
      const enriched={
        user_id:buyerUserId,
        provider_user_id:providerUserId,
        amount:moneyFromCents(grossCents),
        gross_amount:moneyFromCents(grossCents),
        base_amount:moneyFromCents(baseCents),
        customer_fee_amount:moneyFromCents(customerFeeCents),
        platform_commission_amount:moneyFromCents(commissionCents),
        application_fee_amount:moneyFromCents(applicationFeeCents),
        stripe_processing_fee_amount:moneyFromCents(stripeFeeCents),
        provider_net_amount:moneyFromCents(providerNetCents),
        platform_net_amount:moneyFromCents(platformNetCents),
        commission_rate:Number(metadata.commission_rate||0),
        customer_fee_rate:Number(metadata.customer_fee_rate||0),
        currency:session.currency||'eur',
        type:txType,
        status:'completed',
        source_type:sourceType,
        source_id:sourceId,
        stripe_charge_id:chargeId,
        stripe_payment_intent_id:paymentIntentId,
        stripe_connected_account_id:connectedAccountId,
        stripe_transfer_id:transferId,
        financial_metadata:{checkout_session_id:session.id,balance_transaction_id:balance?.id||null,plan_code:metadata.plan_code||null},
      }
      const db=adminSupabase as any
      const {data:existing,error:existingError}=await db.from('transactions').select('id').eq('stripe_payment_intent_id',paymentIntentId).maybeSingle()
      let result:any
      if(existingError&&missingAuditColumns(existingError)) result={error:existingError}
      else if(existingError) throw existingError
      else result=existing?await db.from('transactions').update(enriched).eq('id',existing.id):await db.from('transactions').insert(enriched)
      if(result.error&&missingAuditColumns(result.error)){
        const {data:legacyExisting}=await adminSupabase.from('transactions').select('id').eq('stripe_charge_id',chargeId).maybeSingle()
        const legacy={user_id:buyerUserId,amount:moneyFromCents(grossCents),currency:session.currency||'eur',type:txType,status:'completed',stripe_charge_id:chargeId}
        const fallback=legacyExisting?await adminSupabase.from('transactions').update(legacy).eq('id',legacyExisting.id):await adminSupabase.from('transactions').insert(legacy)
        if(fallback.error)throw fallback.error
        console.warn('Marketplace financial audit columns are not applied yet; persisted legacy transaction only.',{paymentIntentId,sourceType,sourceId})
      }else if(result.error)throw result.error
      return {paymentIntentId,chargeId,transferId,grossCents,stripeFeeCents,providerNetCents,platformNetCents}
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
          const purchasedAt=new Date(); const validityDays=packageDefinition.validity_days==null?null:Number(packageDefinition.validity_days)
          const expiresAt=validityDays&&validityDays>0?new Date(purchasedAt.getTime()+validityDays*86400000).toISOString():null
          const paymentIntentId=typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id
          const {error}=await db.from('service_package_purchases').update({status:'active',sessions_remaining:Number(purchase.sessions_total),purchased_at:purchasedAt.toISOString(),expires_at:expiresAt,stripe_session_id:session.id,stripe_payment_intent_id:paymentIntentId||null,updated_at:purchasedAt.toISOString()}).eq('id',packagePurchaseId).eq('status','pending')
          if(error)throw error
        }
        const settlement=await persistMarketplaceTransaction(session,purchase.user_id,'service_package',packagePurchaseId)
        await recordEvent({service_package_purchase_id:packagePurchaseId,stripe_payment_intent_id:settlement.paymentIntentId})
        return NextResponse.json({received:true})
      }

      const eventParticipantId=session.metadata?.event_participant_id
      if(eventParticipantId){
        const {data:participant}=await adminSupabase.from('event_participants').select('id,event_id,user_id,payment_status,status').eq('id',eventParticipantId).maybeSingle()
        if(!participant)return NextResponse.json({error:'Event participant not found'},{status:404})
        if(participant.payment_status!=='paid'){
          const {error}=await adminSupabase.from('event_participants').update({status:'confirmed',payment_status:'paid',updated_at:new Date().toISOString()}).eq('id',eventParticipantId)
          if(error)throw error
        }
        const settlement=await persistMarketplaceTransaction(session,participant.user_id,'event',eventParticipantId)
        await recordEvent({event_participant_id:eventParticipantId,stripe_payment_intent_id:settlement.paymentIntentId})
        return NextResponse.json({received:true})
      }

      const reservationId=session.metadata?.reservation_id
      if(reservationId){
        const {data:reservation}=await adminSupabase.from('reservations').select('id,user_id,amount,payment_status,service_id,space_id').eq('id',reservationId).maybeSingle()
        if(!reservation)return NextResponse.json({error:'Reservation not found'},{status:404})
        const paidAmount=(session.amount_total||0)/100
        if(Number(reservation.amount)!==Number(paidAmount))return NextResponse.json({error:'Amount mismatch'},{status:400})
        if(reservation.payment_status!=='paid'){
          const {error}=await adminSupabase.from('reservations').update({status:'paid',payment_status:'paid'}).eq('id',reservationId)
          if(error)throw error
        }
        const sourceType=reservation.space_id?'space_reservation':'service_reservation'
        const settlement=await persistMarketplaceTransaction(session,reservation.user_id,sourceType,reservationId)
        await recordEvent({reservation_id:reservationId,stripe_payment_intent_id:settlement.paymentIntentId})
        return NextResponse.json({received:true})
      }
    }

    if(event.type==='customer.subscription.created'||event.type==='customer.subscription.updated'||event.type==='customer.subscription.deleted'){const subscription=event.data.object as Stripe.Subscription; await syncSubscription(subscription,event.type==='customer.subscription.deleted'); await recordEvent(); return NextResponse.json({received:true})}
    if(event.type==='invoice.paid'){await persistInvoiceTransaction(event.data.object as Stripe.Invoice,'completed'); await recordEvent(); return NextResponse.json({received:true})}
    if(event.type==='invoice.payment_failed'){const invoice=event.data.object as Stripe.Invoice; const customerId=typeof invoice.customer==='string'?invoice.customer:invoice.customer?.id; if(customerId)await adminSupabase.from('user_subscriptions').update({status:'past_due',updated_at:new Date().toISOString()}).eq('stripe_customer_id',customerId); await persistInvoiceTransaction(invoice,'failed'); await recordEvent(); return NextResponse.json({received:true})}
    await recordEvent(); return NextResponse.json({received:true})
  } catch(err:any){console.error('Webhook error:',err.message); return NextResponse.json({error:'Webhook Error'},{status:400})}
}
