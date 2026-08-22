export type SettlementExecutionInput = {
  reservationId: string
  transactionId: string
  amount: number
  currency: string
  destination: string
  sourceCharge?: string | null
  sourceType?: string | null
}

export type SettlementExecutionDeps = {
  acquireLock: (reservationId: string) => Promise<boolean>
  releaseLock: (reservationId: string) => Promise<void>
  createTransfer: (input: {
    amount: number
    currency: string
    destination: string
    sourceCharge?: string | null
    transferGroup: string
    idempotencyKey: string
    metadata: Record<string, string>
  }) => Promise<{ id: string }>
  persistTransfer: (transactionId: string, transferId: string) => Promise<void>
  finalizeSettlement: (reservationId: string, transferId: string) => Promise<boolean>
}

/**
 * Pure orchestration boundary for the external financial side effect.
 * Infrastructure adapters (Supabase/Stripe) live outside this function so
 * concurrency, crash and idempotency behaviour can be tested without money.
 */
export async function executeSettlement(input: SettlementExecutionInput, deps: SettlementExecutionDeps) {
  const locked = await deps.acquireLock(input.reservationId)
  if (!locked) return { transferred: false, reason: 'lock_not_acquired' as const }

  const transferGroup = `f4s:${input.sourceType || 'reservation'}:${input.reservationId}`
  const idempotencyKey = `reservation-settlement:${input.reservationId}`
  let transfer: { id: string }
  try {
    transfer = await deps.createTransfer({
      amount: input.amount,
      currency: input.currency,
      destination: input.destination,
      sourceCharge: input.sourceCharge,
      transferGroup,
      idempotencyKey,
      metadata: {
        reservation_id: input.reservationId,
        transaction_id: input.transactionId,
        settlement: 'athlete_or_timeout_confirmed',
      },
    })
  } catch (error) {
    await deps.releaseLock(input.reservationId)
    throw error
  }

  // Once Stripe returned a transfer, never release the lock on local failure.
  // Reconciliation must determine the financial truth before any retry.
  await deps.persistTransfer(input.transactionId, transfer.id)
  const finalized = await deps.finalizeSettlement(input.reservationId, transfer.id)
  if (!finalized) throw new Error('Transfer created but settlement state changed before finalization.')

  return { transferred: true, transferId: transfer.id, idempotencyKey, transferGroup }
}
