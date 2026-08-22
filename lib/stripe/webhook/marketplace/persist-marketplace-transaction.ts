import type Stripe from 'stripe'

const cents=(v:unknown)=>{const n=Number(v);return Number.isFinite(n)?n:0}
const money=(v:unknown)=>cents(v)/100
const missingAuditColumns=(error:any)=>{const code=String(error?.code||'');const msg=String(error?.message||'');return ['42703','PGRST204'].includes(code)||['gross_amount','stripe_payment_intent_id','provider_net_amount','financial_metadata'].some(k=>msg.includes(k))}

export async function persistMarketplaceTransaction(db:any,stripe:Stripe,session:Stripe.Checkout.Session,buyerUserId:string,sourceType:string,sourceId:string){
 const paymentIntentId=typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id
 if(!paymentIntentId)throw new Error(`Checkout ${session.id} has no payment intent`)
 const paymentIntent=await stripe.paymentIntents.retrieve(paymentIntentId,{expand:['latest_charge.balance_transaction']})
 const pi:any=paymentIntent,charge:any=typeof pi.latest_charge==='object'?pi.latest_charge:null,balance:any=charge&&typeof charge.balance_transaction==='object'?charge.balance_transaction:null
 const metadata={...(session.metadata||{}),...(paymentIntent.metadata||{})},base=cents(metadata.base_amount_cents),customerFee=cents(metadata.customer_fee_cents),commission=cents(metadata.platform_commission_cents),applicationFee=cents(metadata.application_fee_cents),gross=cents(session.amount_total),stripeFee=cents(balance?.fee)
 const providerNet=Math.max(0,base-commission),platformNet=applicationFee-stripeFee,chargeId=charge?.id||paymentIntentId,providerUserId=metadata.provider_user_id||null,connectedAccountId=metadata.connected_account_id||null,transferId=typeof charge?.transfer==='string'?charge.transfer:charge?.transfer?.id||null,txType=`${sourceType}_payment`
 const enriched={user_id:buyerUserId,provider_user_id:providerUserId,amount:money(gross),gross_amount:money(gross),base_amount:money(base),customer_fee_amount:money(customerFee),platform_commission_amount:money(commission),application_fee_amount:money(applicationFee),stripe_processing_fee_amount:money(stripeFee),provider_net_amount:money(providerNet),platform_net_amount:money(platformNet),commission_rate:Number(metadata.commission_rate||0),customer_fee_rate:Number(metadata.customer_fee_rate||0),currency:session.currency||'eur',type:txType,status:'completed',source_type:sourceType,source_id:sourceId,stripe_charge_id:chargeId,stripe_payment_intent_id:paymentIntentId,stripe_connected_account_id:connectedAccountId,stripe_transfer_id:transferId,financial_metadata:{checkout_session_id:session.id,balance_transaction_id:balance?.id||null,plan_code:metadata.plan_code||null}}
 const {data:existing,error:existingError}=await db.from('transactions').select('id').eq('stripe_payment_intent_id',paymentIntentId).in('type',['service_reservation_payment','space_reservation_payment','service_package_payment','event_payment']).maybeSingle()
 let result:any
 if(existingError&&missingAuditColumns(existingError))result={error:existingError};else if(existingError)throw existingError;else result=existing?await db.from('transactions').update(enriched).eq('id',existing.id):await db.from('transactions').insert(enriched)
 if(result.error&&missingAuditColumns(result.error)){const {data:legacy}=await db.from('transactions').select('id').eq('stripe_charge_id',chargeId).maybeSingle();const payload={user_id:buyerUserId,amount:money(gross),currency:session.currency||'eur',type:txType,status:'completed',stripe_charge_id:chargeId};const fallback=legacy?await db.from('transactions').update(payload).eq('id',legacy.id):await db.from('transactions').insert(payload);if(fallback.error)throw fallback.error}else if(result.error)throw result.error
 return {paymentIntentId,chargeId,transferId}
}
