import 'server-only'

import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

type ReconcileResult = {
  id: string
  ok: boolean
  action: 'transferred' | 'eligible' | 'unchanged'
  transferId?: string
  error?: string
}

function message(error: unknown) {
  return error instanceof Error ? error.message : String(error || 'Erro desconhecido')
}

/**
 * Reconciles stale reservation settlement locks without guessing.
 *
 * Source of truth order:
 * 1. Local transaction already has stripe_transfer_id -> transferred.
 * 2. Stripe transfer found by deterministic transfer_group -> persist id + transferred.
 * 3. No matching Stripe transfer -> eligible for a safe retry.
 *
 * The normal settlement path uses an idempotency key per reservation, so a later
 * retry remains protected even if a previous HTTP response was lost.
 */
export async function reconcileProcessingSettlements(staleMinutes = 15, limit = 25): Promise<ReconcileResult[]> {
  const db = createAdminClient() as any
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error('Stripe não está configurado.')
  const stripe = new Stripe(secret)
  const cutoff = new Date(Date.now() - Math.max(1, staleMinutes) * 60_000).toISOString()

  const { data: reservations, error } = await db.from('reservations')
    .select('id,updated_at')
    .eq('payment_status', 'paid')
    .eq('service_delivery_status', 'completed')
    .eq('settlement_status', 'processing')
    .lte('updated_at', cutoff)
    .order('updated_at', { ascending: true })
    .limit(limit)
  if (error) throw error

  const results: ReconcileResult[] = []
  for (const reservation of reservations || []) {
    try {
      const { data: tx, error: txError } = await db.from('transactions')
        .select('id,source_type,stripe_transfer_id')
        .eq('source_id', reservation.id)
        .in('type', ['service_reservation_payment', 'space_reservation_payment'])
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (txError) throw txError
      if (!tx) throw new Error('Transação financeira da reserva não encontrada.')

      let transferId = String(tx.stripe_transfer_id || '')
      if (!transferId.startsWith('tr_')) {
        const group = `f4s:${tx.source_type || 'reservation'}:${reservation.id}`
        const transfers = await stripe.transfers.list({ transfer_group: group, limit: 10 })
        const transfer = transfers.data.find((item) => item.transfer_group === group)
        transferId = transfer?.id || ''
      }

      if (transferId.startsWith('tr_')) {
        const now = new Date().toISOString()
        const { error: persistError } = await db.from('transactions').update({ stripe_transfer_id: transferId }).eq('id', tx.id)
        if (persistError) throw persistError
        const { data: finalized, error: finalizeError } = await db.from('reservations')
          .update({ settlement_status: 'transferred', settlement_released_at: now, updated_at: now })
          .eq('id', reservation.id)
          .eq('settlement_status', 'processing')
          .select('id')
          .maybeSingle()
        if (finalizeError) throw finalizeError
        results.push({ id: reservation.id, ok: true, action: finalized ? 'transferred' : 'unchanged', transferId })
        continue
      }

      const { data: released, error: releaseError } = await db.from('reservations')
        .update({ settlement_status: 'eligible', updated_at: new Date().toISOString() })
        .eq('id', reservation.id)
        .eq('settlement_status', 'processing')
        .select('id')
        .maybeSingle()
      if (releaseError) throw releaseError
      results.push({ id: reservation.id, ok: true, action: released ? 'eligible' : 'unchanged' })
    } catch (error) {
      results.push({ id: reservation.id, ok: false, action: 'unchanged', error: message(error) })
    }
  }
  return results
}
