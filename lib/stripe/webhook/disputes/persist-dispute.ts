import { syncReservationDispute } from './sync-reservation-dispute'

type DbClient = any

type DisputeLike = {
  id: string
  amount: number
  currency?: string | null
  status?: string | null
  reason?: string | null
  charge?: string | { id?: string | null } | null
  payment_intent?: string | { id?: string | null } | null
}

function moneyFromCents(value: unknown) {
  const amount = Number(value)
  return (Number.isFinite(amount) ? amount : 0) / 100
}

function disputeStatus(status: string | null | undefined): 'pending' | 'completed' | 'failed' {
  if (status === 'lost') return 'completed'
  if (status === 'won' || status === 'warning_closed') return 'failed'
  return 'pending'
}

function objectId(value: string | { id?: string | null } | null | undefined) {
  if (typeof value === 'string') return value
  return value?.id || null
}

async function findOriginalTransaction(db: DbClient, chargeId?: string | null, paymentIntentId?: string | null) {
  const select = 'id,user_id,provider_user_id,amount,gross_amount,provider_net_amount,platform_net_amount,currency,source_type,source_id,stripe_charge_id,stripe_payment_intent_id,stripe_connected_account_id,stripe_transfer_id'

  if (paymentIntentId) {
    const { data, error } = await db.from('transactions').select(select)
      .eq('stripe_payment_intent_id', paymentIntentId)
      .in('type', ['service_reservation_payment', 'space_reservation_payment', 'service_package_payment', 'event_payment'])
      .maybeSingle()
    if (error) throw error
    if (data) return data
  }

  if (chargeId) {
    const { data, error } = await db.from('transactions').select(select).eq('stripe_charge_id', chargeId).maybeSingle()
    if (error) throw error
    if (data) return data
  }

  return null
}

/**
 * Persists Stripe dispute state as an idempotent financial-ledger entry and
 * synchronizes reservation settlement protection from the same authoritative
 * Stripe event.
 */
export async function persistDispute(db: DbClient, dispute: DisputeLike) {
  const chargeId = objectId(dispute.charge)
  const paymentIntentId = objectId(dispute.payment_intent)
  const original = await findOriginalTransaction(db, chargeId, paymentIntentId)
  if (!original) return { persisted: false, original: null }

  const originalGross = Math.max(Number(original.gross_amount ?? original.amount ?? 0), 0.01)
  const disputeAmount = moneyFromCents(dispute.amount)
  const ratio = Math.min(1, disputeAmount / originalGross)
  const payload = {
    user_id: original.provider_user_id || original.user_id,
    provider_user_id: null,
    amount: disputeAmount,
    gross_amount: disputeAmount,
    base_amount: disputeAmount,
    provider_net_amount: Number(original.provider_net_amount || 0) * ratio,
    platform_net_amount: Number(original.platform_net_amount || 0) * ratio,
    currency: dispute.currency || original.currency || 'eur',
    type: 'dispute',
    status: disputeStatus(dispute.status),
    source_type: original.source_type,
    source_id: original.source_id,
    related_transaction_id: original.id,
    stripe_charge_id: dispute.id,
    stripe_payment_intent_id: original.stripe_payment_intent_id,
    stripe_connected_account_id: original.stripe_connected_account_id,
    stripe_transfer_id: original.stripe_transfer_id,
    financial_metadata: {
      dispute_id: dispute.id,
      dispute_status: dispute.status || null,
      dispute_reason: dispute.reason || null,
      original_charge_id: chargeId,
      buyer_user_id: original.user_id,
      provider_user_id: original.provider_user_id,
      dispute_ratio: ratio,
    },
  }

  const { data: existing, error: existingError } = await db.from('transactions').select('id').eq('stripe_charge_id', dispute.id).maybeSingle()
  if (existingError) throw existingError

  const result = existing
    ? await db.from('transactions').update(payload).eq('id', existing.id)
    : await db.from('transactions').insert(payload)
  if (result.error) throw result.error

  await syncReservationDispute(db, original, dispute)

  return { persisted: true, original }
}
