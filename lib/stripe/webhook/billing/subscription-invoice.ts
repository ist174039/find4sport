import type Stripe from 'stripe'

const asIso=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?new Date(v*1000).toISOString():null
const normalize=(s:string)=>new Set(['active','canceled','past_due','trialing','incomplete','incomplete_expired','unpaid','paused']).has(s)?s:'incomplete'

export async function syncSubscription(db:any,subscription:Stripe.Subscription,forceCanceled=false){
 const userId=subscription.metadata?.user_id,planId=subscription.metadata?.plan_id,planCode=subscription.metadata?.plan_code
 if(!userId||!planId||!['pro','premium'].includes(planCode||''))throw new Error(`Subscription ${subscription.id} missing Find4Sport metadata`)
 const raw=subscription as any,customerId=typeof subscription.customer==='string'?subscription.customer:subscription.customer?.id,status=forceCanceled?'canceled':normalize(subscription.status)
 const {error}=await db.from('user_subscriptions').upsert({user_id:userId,plan_id:planId,tier:planCode,stripe_customer_id:customerId||null,stripe_subscription_id:subscription.id,status,current_period_start:asIso(raw.current_period_start),current_period_end:asIso(raw.current_period_end),cancel_at_period_end:Boolean(raw.cancel_at_period_end),updated_at:new Date().toISOString()},{onConflict:'user_id'})
 if(error)throw error
}

export async function persistInvoiceTransaction(db:any,invoice:Stripe.Invoice,status:'completed'|'failed'){
 const customerId=typeof invoice.customer==='string'?invoice.customer:invoice.customer?.id;if(!customerId)return
 const {data:subscriptionRow}=await db.from('user_subscriptions').select('user_id').eq('stripe_customer_id',customerId).maybeSingle();if(!subscriptionRow?.user_id)return
 const invoiceId=invoice.id,{data:existing}=await db.from('transactions').select('id').eq('stripe_charge_id',invoiceId).maybeSingle()
 const payload={user_id:subscriptionRow.user_id,amount:Number((status==='completed'?invoice.amount_paid:invoice.amount_due)||0)/100,currency:invoice.currency||'eur',type:'subscription_payment',status,stripe_charge_id:invoiceId,financial_metadata:{invoice_id:invoiceId}}
 const result=existing?await db.from('transactions').update(payload).eq('id',existing.id):await db.from('transactions').insert(payload);if(result.error)throw result.error
}
