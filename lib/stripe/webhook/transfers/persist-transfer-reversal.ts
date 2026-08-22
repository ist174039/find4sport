type DbClient = any

type TransferLike = {
  id: string
  amount_reversed?: number | null
  currency?: string | null
}

function moneyFromCents(value: unknown) {
  const amount = Number(value)
  return (Number.isFinite(amount) ? amount : 0) / 100
}

/**
 * Persists the accumulated Stripe transfer reversal in the financial ledger.
 * Idempotency is keyed by transfer id because transfer.reversed describes the
 * transfer's accumulated reversed amount rather than a client-authored state.
 */
export async function persistTransferReversal(db: DbClient, transfer: TransferLike) {
  const { data: original, error: originalError } = await db
    .from('transactions')
    .select('id,user_id,provider_user_id,currency,source_type,source_id,stripe_payment_intent_id,stripe_connected_account_id,stripe_transfer_id')
    .eq('stripe_transfer_id', transfer.id)
    .in('type', ['service_reservation_payment', 'space_reservation_payment', 'service_package_payment', 'event_payment'])
    .maybeSingle()

  if (originalError) throw originalError
  if (!original) return { persisted: false, original: null }

  const reversedCents = Number(transfer.amount_reversed || 0)
  const reversalKey = `transfer_reversal:${transfer.id}`
  const payload = {
    user_id: original.provider_user_id || original.user_id,
    provider_user_id: null,
    amount: moneyFromCents(reversedCents),
    gross_amount: moneyFromCents(reversedCents),
    currency: transfer.currency || original.currency || 'eur',
    type: 'transfer_reversal',
    status: 'completed',
    source_type: original.source_type,
    source_id: original.source_id,
    related_transaction_id: original.id,
    stripe_charge_id: reversalKey,
    stripe_payment_intent_id: original.stripe_payment_intent_id,
    stripe_connected_account_id: original.stripe_connected_account_id,
    stripe_transfer_id: transfer.id,
    financial_metadata: {
      transfer_id: transfer.id,
      amount_reversed_cents: reversedCents,
      provider_user_id: original.provider_user_id,
    },
  }

  const { data: existing, error: existingError } = await db
    .from('transactions')
    .select('id')
    .eq('stripe_charge_id', reversalKey)
    .maybeSingle()
  if (existingError) throw existingError

  const result = existing
    ? await db.from('transactions').update(payload).eq('id', existing.id)
    : await db.from('transactions').insert(payload)
  if (result.error) throw result.error

  return { persisted: true, original }
}
