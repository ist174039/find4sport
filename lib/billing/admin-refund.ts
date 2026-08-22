import 'server-only'
import Stripe from 'stripe'
import { executeReservationRefund, type RefundDeps, type RefundInput } from './admin-refund-core'

export { executeReservationRefund }
export type { RefundDeps, RefundInput }

export async function createReservationRefund(input:RefundInput){
 const secret=process.env.STRIPE_SECRET_KEY;if(!secret)throw new Error('Stripe não está configurado.');const stripe=new Stripe(secret)
 return executeReservationRefund(input,{retrieveTransfer:async id=>stripe.transfers.retrieve(id),createReversal:async(id,amount,metadata,key)=>stripe.transfers.createReversal(id,{amount,metadata},{idempotencyKey:key}),createRefund:async(payment,metadata,key)=>stripe.refunds.create({...payment,reason:'requested_by_customer',metadata},{idempotencyKey:key})})
}
