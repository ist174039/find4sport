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
  if (input.transferId) throw new Error('O valor já foi transferido ao prestador. É necessária uma reversão financeira antes do reembolso.')
  const secret=process.env.STRIPE_SECRET_KEY
  if(!secret) throw new Error('Stripe não está configurado.')
  const chargeId=String(input.chargeId||''), paymentIntentId=String(input.paymentIntentId||'')
  if(!chargeId.startsWith('ch_')&&!paymentIntentId.startsWith('pi_')) throw new Error('Pagamento Stripe da reserva não encontrado.')
  const stripe=new Stripe(secret)
  const refund=await stripe.refunds.create({
    ...(chargeId.startsWith('ch_')?{charge:chargeId}:{payment_intent:paymentIntentId}),
    reason:'requested_by_customer',
    metadata:{reservation_id:input.reservationId,resolution:input.reason},
  },{idempotencyKey:`reservation-refund:${input.reservationId}:${input.reason}`})
  if(!['pending','succeeded'].includes(refund.status||'')) throw new Error('O Stripe não aceitou o reembolso.')
  return { id:refund.id, status:refund.status, succeeded:refund.status==='succeeded' }
}
