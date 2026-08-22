import 'server-only'
import Stripe from 'stripe'

type RefundInput = {
  reservationId: string
  chargeId?: string | null
  paymentIntentId?: string | null
  transferId?: string | null
  reason: string
}

export async function createReservationRefund(input: RefundInput) {
  const secret=process.env.STRIPE_SECRET_KEY
  if(!secret) throw new Error('Stripe não está configurado.')
  const chargeId=String(input.chargeId||''), paymentIntentId=String(input.paymentIntentId||''), transferId=String(input.transferId||'')
  if(!chargeId.startsWith('ch_')&&!paymentIntentId.startsWith('pi_')) throw new Error('Pagamento Stripe da reserva não encontrado.')
  const stripe=new Stripe(secret)
  let reversal: { id:string; amount:number } | null=null

  if(transferId.startsWith('tr_')) {
    const transfer=await stripe.transfers.retrieve(transferId)
    const remaining=Math.max(0,Number(transfer.amount||0)-Number(transfer.amount_reversed||0))
    if(remaining>0){
      const reversed=await stripe.transfers.createReversal(transferId,{amount:remaining,metadata:{reservation_id:input.reservationId,resolution:input.reason}},{idempotencyKey:`reservation-transfer-reversal:${input.reservationId}:${input.reason}`})
      reversal={id:reversed.id,amount:reversed.amount}
    }
  }

  const refund=await stripe.refunds.create({
    ...(chargeId.startsWith('ch_')?{charge:chargeId}:{payment_intent:paymentIntentId}),
    reason:'requested_by_customer',
    metadata:{reservation_id:input.reservationId,resolution:input.reason,reversal_id:reversal?.id||''},
  },{idempotencyKey:`reservation-refund:${input.reservationId}:${input.reason}`})
  if(!['pending','succeeded'].includes(refund.status||'')) throw new Error('O Stripe não aceitou o reembolso.')
  return { id:refund.id, status:refund.status, succeeded:refund.status==='succeeded', reversal }
}
