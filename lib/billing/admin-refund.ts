import 'server-only'
import Stripe from 'stripe'

type RefundInput={reservationId:string;chargeId?:string|null;paymentIntentId?:string|null;transferId?:string|null;reason:string}
type Transfer={id:string;amount:number;amount_reversed?:number|null}
type Reversal={id:string;amount:number}
type Refund={id:string;status:string|null}
export type RefundDeps={retrieveTransfer:(id:string)=>Promise<Transfer>;createReversal:(id:string,amount:number,metadata:Record<string,string>,idempotencyKey:string)=>Promise<Reversal>;createRefund:(payment:{charge?:string;payment_intent?:string},metadata:Record<string,string>,idempotencyKey:string)=>Promise<Refund>}

export async function executeReservationRefund(input:RefundInput,deps:RefundDeps){
 const chargeId=String(input.chargeId||''),paymentIntentId=String(input.paymentIntentId||''),transferId=String(input.transferId||'')
 if(!chargeId.startsWith('ch_')&&!paymentIntentId.startsWith('pi_'))throw new Error('Pagamento Stripe da reserva não encontrado.')
 let reversal:Reversal|null=null
 if(transferId.startsWith('tr_')){const transfer=await deps.retrieveTransfer(transferId);const remaining=Math.max(0,Number(transfer.amount||0)-Number(transfer.amount_reversed||0));if(remaining>0)reversal=await deps.createReversal(transferId,remaining,{reservation_id:input.reservationId,resolution:input.reason},`reservation-transfer-reversal:${input.reservationId}:${input.reason}`)}
 const refund=await deps.createRefund(chargeId.startsWith('ch_')?{charge:chargeId}:{payment_intent:paymentIntentId},{reservation_id:input.reservationId,resolution:input.reason,reversal_id:reversal?.id||''},`reservation-refund:${input.reservationId}:${input.reason}`)
 if(!['pending','succeeded'].includes(refund.status||''))throw new Error('O Stripe não aceitou o reembolso.')
 return{id:refund.id,status:refund.status,succeeded:refund.status==='succeeded',reversal}
}

export async function createReservationRefund(input:RefundInput){
 const secret=process.env.STRIPE_SECRET_KEY;if(!secret)throw new Error('Stripe não está configurado.');const stripe=new Stripe(secret)
 return executeReservationRefund(input,{retrieveTransfer:async id=>stripe.transfers.retrieve(id) as any,createReversal:async(id,amount,metadata,key)=>stripe.transfers.createReversal(id,{amount,metadata},{idempotencyKey:key}) as any,createRefund:async(payment,metadata,key)=>stripe.refunds.create({...payment,reason:'requested_by_customer',metadata},{idempotencyKey:key}) as any})
}
