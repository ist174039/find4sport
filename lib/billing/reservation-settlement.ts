import 'server-only'

import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const AUTO_CONFIRM_HOURS = 48

function reservationEnd(row: { date: string; end_time: string }) {
  return new Date(`${row.date}T${String(row.end_time).slice(0, 8)}`)
}

export async function releaseReservationSettlement(reservationId: string) {
  const db = createAdminClient() as any
  const { data: reservation, error: reservationError } = await db.from('reservations').select('id,payment_status,settlement_status,service_delivery_status').eq('id', reservationId).maybeSingle()
  if (reservationError || !reservation) throw new Error('Reserva não encontrada para liquidação.')
  if (reservation.payment_status !== 'paid') throw new Error('A reserva ainda não está paga.')
  if (reservation.service_delivery_status !== 'completed') throw new Error('O serviço ainda não foi confirmado como concluído.')
  if (reservation.settlement_status === 'transferred' || reservation.settlement_status === 'not_applicable') return { transferred: reservation.settlement_status === 'transferred', alreadyDone: true }
  if (reservation.settlement_status !== 'eligible') throw new Error('O valor ainda não está elegível para transferência.')

  const { data: transaction, error: txError } = await db.from('transactions').select('id,currency,provider_net_amount,stripe_charge_id,stripe_transfer_id,stripe_connected_account_id,source_type,source_id,status').eq('source_id', reservationId).in('type', ['service_reservation_payment','space_reservation_payment']).eq('status','completed').order('created_at',{ascending:false}).limit(1).maybeSingle()
  if (txError || !transaction) throw new Error('Transação financeira da reserva não encontrada.')

  if (transaction.stripe_transfer_id) {
    const now = new Date().toISOString()
    await db.from('reservations').update({ settlement_status:'transferred', settlement_released_at:now, updated_at:now }).eq('id', reservationId)
    return { transferred:true, alreadyDone:true }
  }

  const amount = Math.round(Number(transaction.provider_net_amount || 0) * 100)
  const destination = String(transaction.stripe_connected_account_id || '')
  if (!(amount > 0) || !destination.startsWith('acct_')) throw new Error('Dados de liquidação do prestador incompletos.')
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error('Stripe não está configurado.')
  const stripe = new Stripe(secret)
  const sourceCharge = String(transaction.stripe_charge_id || '')
  const transfer = await stripe.transfers.create({
    amount,
    currency: String(transaction.currency || 'eur'),
    destination,
    ...(sourceCharge.startsWith('ch_') ? { source_transaction: sourceCharge } : {}),
    transfer_group: `f4s:${transaction.source_type || 'reservation'}:${reservationId}`,
    metadata: { reservation_id: reservationId, transaction_id: transaction.id, settlement: 'athlete_or_timeout_confirmed' },
  }, { idempotencyKey: `reservation-settlement:${reservationId}` })

  const now = new Date().toISOString()
  const { error: txUpdateError } = await db.from('transactions').update({ stripe_transfer_id:transfer.id }).eq('id', transaction.id).is('stripe_transfer_id', null)
  if (txUpdateError) throw txUpdateError
  const { error: reservationUpdateError } = await db.from('reservations').update({ settlement_status:'transferred', settlement_released_at:now, updated_at:now }).eq('id', reservationId).eq('settlement_status','eligible')
  if (reservationUpdateError) throw reservationUpdateError
  await db.from('reservation_delivery_events').insert({ reservation_id:reservationId, event_type:'settlement_released', metadata:{ stripe_transfer_id:transfer.id } })
  return { transferred:true, transferId:transfer.id }
}

export async function processDueAutoConfirmations(limit = 25) {
  const db = createAdminClient() as any
  const now = new Date().toISOString()
  const { data: rows } = await db.from('reservations').select('id').eq('payment_status','paid').eq('service_delivery_status','awaiting_customer_confirmation').eq('settlement_status','held').lte('auto_confirm_after',now).order('auto_confirm_after',{ascending:true}).limit(limit)
  const results: Array<{ id:string; ok:boolean }> = []
  for (const row of rows || []) {
    try {
      const { data: updated } = await db.from('reservations').update({ service_delivery_status:'completed', settlement_status:'eligible', status:'completed', updated_at:now }).eq('id',row.id).eq('service_delivery_status','awaiting_customer_confirmation').eq('settlement_status','held').select('id').maybeSingle()
      if (!updated) continue
      await db.from('reservation_delivery_events').insert({ reservation_id:row.id, event_type:'auto_confirmed', note:`Auto-confirmação após ${AUTO_CONFIRM_HOURS}h sem disputa.` })
      await releaseReservationSettlement(row.id)
      results.push({ id:row.id, ok:true })
    } catch { results.push({ id:row.id, ok:false }) }
  }
  return results
}

export function autoConfirmAtFromNow() { return new Date(Date.now() + AUTO_CONFIRM_HOURS * 60 * 60 * 1000).toISOString() }
export function canMarkDelivered(row: { date:string; end_time:string }) { const end=reservationEnd(row); return !Number.isNaN(end.getTime()) && end.getTime() <= Date.now() }
