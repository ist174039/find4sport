type DbClient = any

type OriginalTransaction = {
  source_type?: string | null
  source_id?: string | null
}

type RefundLike = {
  id: string
  status?: string | null
}

const RESERVATION_SOURCE_TYPES = new Set(['service_reservation', 'space_reservation'])

/**
 * Synchronizes the reservation state from a Stripe refund.
 * Stripe remains the authority for completion: only a succeeded refund can
 * transition refund_pending/blocked to refunded/refunded.
 */
export async function syncReservationRefund(
  db: DbClient,
  original: OriginalTransaction,
  refund: RefundLike,
) {
  if (!original.source_id || !RESERVATION_SOURCE_TYPES.has(String(original.source_type || ''))) return

  const reservationId = String(original.source_id)
  const now = new Date().toISOString()

  if (refund.status === 'succeeded') {
    const { error } = await db
      .from('reservations')
      .update({
        payment_status: 'refunded',
        settlement_status: 'refunded',
        status: 'cancelled',
        service_delivery_status: 'cancelled',
        updated_at: now,
      })
      .eq('id', reservationId)
      .in('payment_status', ['paid', 'refund_pending', 'refunded'])
      .in('settlement_status', ['held', 'blocked', 'refunded'])

    if (error) throw error

    await db.from('reservation_delivery_events').upsert({
      reservation_id: reservationId,
      event_type: 'refund_completed',
      note: 'Reembolso confirmado pelo Stripe.',
      metadata: { stripe_refund_id: refund.id, stripe_refund_status: refund.status },
    }, { onConflict: 'reservation_id,event_type' })
    return
  }

  if (refund.status === 'pending') {
    const { error } = await db
      .from('reservations')
      .update({
        payment_status: 'refund_pending',
        settlement_status: 'blocked',
        updated_at: now,
      })
      .eq('id', reservationId)
      .eq('payment_status', 'paid')
      .in('settlement_status', ['held', 'blocked'])

    if (error) throw error
  }
}
