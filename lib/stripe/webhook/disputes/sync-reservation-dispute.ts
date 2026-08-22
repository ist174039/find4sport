type DbClient = any

type OriginalTransaction = {
  source_type?: string | null
  source_id?: string | null
}

type DisputeLike = {
  id: string
  status?: string | null
  reason?: string | null
}

const RESERVATION_SOURCE_TYPES = new Set(['service_reservation', 'space_reservation'])
const OPEN_DISPUTE_STATUSES = new Set([
  'warning_needs_response',
  'warning_under_review',
  'needs_response',
  'under_review',
])

/**
 * Protects reservation settlement when Stripe reports a card dispute.
 * A Stripe dispute must never leave provider settlement eligible while funds
 * are at risk. Closed outcomes are deliberately not auto-released here:
 * settlement release remains an explicit server-side operation.
 */
export async function syncReservationDispute(
  db: DbClient,
  original: OriginalTransaction,
  dispute: DisputeLike,
) {
  if (!original.source_id || !RESERVATION_SOURCE_TYPES.has(String(original.source_type || ''))) return
  if (!OPEN_DISPUTE_STATUSES.has(String(dispute.status || ''))) return

  const reservationId = String(original.source_id)
  const now = new Date().toISOString()

  const { error } = await db
    .from('reservations')
    .update({
      service_delivery_status: 'disputed',
      settlement_status: 'blocked',
      updated_at: now,
    })
    .eq('id', reservationId)
    .eq('payment_status', 'paid')
    .in('settlement_status', ['held', 'eligible', 'blocked'])

  if (error) throw error
}
