import type Stripe from 'stripe'
import { syncReservationRefund } from './sync-reservation-refund'

const money = (value: unknown) => Number(value || 0) / 100

function status(value: string | null | undefined): 'pending' | 'completed' | 'failed' {
  return value === 'succeeded' ? 'completed' : value === 'pending' ? 'pending' : 'failed'
}

async function findOriginal(db: any, chargeId: string, paymentIntentId: string | null) {
  const select = 'id,user_id,provider_user_id,amount,gross_amount,base_amount,provider_net_amount,platform_net_amount,currency,source_type,source_id,stripe_charge_id,stripe_payment_intent_id,stripe_connected_account_id,stripe_transfer_id,financial_metadata'
  if (paymentIntentId) {
    const { data } = await db.from('transactions').select(select).eq('stripe_payment_intent_id', paymentIntentId).in('type', ['service_reservation_payment','space_reservation_payment','service_package_payment','event_payment']).maybeSingle()
    if (data) return data
  }
  const { data } = await db.from('transactions').select(select).eq('stripe_charge_id', chargeId).maybeSingle()
  return data || null
}

export async function persistRefunds(db: any, charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id || null
  const original = await findOriginal(db, charge.id, paymentIntentId)
  if (!original) return
  const originalGross = Math.max(Number(original.gross_amount ?? original.amount ?? 0), 0.01)

  for (const refund of charge.refunds?.data || []) {
    const refundAmount = money(refund.amount)
    const ratio = Math.min(1, refundAmount / originalGross)
    const payload = {
      user_id: original.provider_user_id || original.user_id,
      provider_user_id: null,
      amount: refundAmount,
      gross_amount: refundAmount,
      base_amount: refundAmount,
      provider_net_amount: Number(original.provider_net_amount || 0) * ratio,
      platform_net_amount: Number(original.platform_net_amount || 0) * ratio,
      currency: refund.currency || original.currency || 'eur',
      type: 'refund', status: status(refund.status), source_type: original.source_type, source_id: original.source_id,
      related_transaction_id: original.id, stripe_charge_id: refund.id, stripe_payment_intent_id: original.stripe_payment_intent_id,
      stripe_connected_account_id: original.stripe_connected_account_id, stripe_transfer_id: original.stripe_transfer_id,
      financial_metadata: { refund_id: refund.id, refund_reason: refund.reason || null, original_charge_id: charge.id, buyer_user_id: original.user_id, provider_user_id: original.provider_user_id, refund_ratio: ratio },
    }
    const { data: existing } = await db.from('transactions').select('id').eq('stripe_charge_id', refund.id).maybeSingle()
    const result = existing ? await db.from('transactions').update(payload).eq('id', existing.id) : await db.from('transactions').insert(payload)
    if (result.error) throw result.error
    await syncReservationRefund(db, original, refund)
  }
}
