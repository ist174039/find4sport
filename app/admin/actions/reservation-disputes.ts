'use server'

import Stripe from 'stripe'
import { revalidatePath } from 'next/cache'
import { requireAdminAccess } from '@/lib/auth/access'
import { releaseReservationSettlement } from '@/lib/billing/reservation-settlement'

type Resolution = 'release' | 'refund'

async function providerUserId(db: any, reservation: { professional_id?: string | null; space_id?: string | null }) {
  if (reservation.professional_id) return (await db.from('professionals').select('user_id').eq('id', reservation.professional_id).maybeSingle()).data?.user_id || null
  if (reservation.space_id) return (await db.from('sport_spaces').select('owner_user_id').eq('id', reservation.space_id).maybeSingle()).data?.owner_user_id || null
  return null
}

async function notify(db: any, userId: string | null, message: string, reservationId: string, suffix: string, link = '/dashboard/agenda') {
  if (!userId) return
  await db.from('notifications').insert({ user_id: userId, type: 'reservation', message, link, data: { reservation_id: reservationId }, dedupe_key: `dispute:${reservationId}:${suffix}` })
}

export async function resolveReservationDisputeAction(reservationId: string, resolution: Resolution, note: string) {
  const { user, admin } = await requireAdminAccess()
  const db = admin as any
  const cleanNote = String(note || '').trim()
  if (cleanNote.length < 5 || cleanNote.length > 2000) throw new Error('Regista uma justificação entre 5 e 2000 caracteres.')

  const { data: reservation, error: reservationError } = await db.from('reservations')
    .select('id,user_id,professional_id,space_id,status,payment_status,service_delivery_status,settlement_status')
    .eq('id', reservationId)
    .maybeSingle()
  if (reservationError || !reservation) throw new Error('Reserva não encontrada.')
  if (reservation.payment_status !== 'paid' || reservation.service_delivery_status !== 'disputed' || reservation.settlement_status !== 'blocked') throw new Error('Esta contestação já não está pendente de decisão.')

  const providerId = await providerUserId(db, reservation)
  const now = new Date().toISOString()

  if (resolution === 'release') {
    const previousStatus = reservation.status
    const { data: updated, error } = await db.from('reservations').update({ service_delivery_status:'completed', settlement_status:'eligible', status:'completed', updated_at:now }).eq('id', reservationId).eq('service_delivery_status','disputed').eq('settlement_status','blocked').select('id').maybeSingle()
    if (error || !updated) throw new Error(error?.message || 'Não foi possível resolver a contestação.')
    try {
      await releaseReservationSettlement(reservationId)
    } catch (error) {
      await db.from('reservations').update({ service_delivery_status:'disputed', settlement_status:'blocked', status:previousStatus, updated_at:new Date().toISOString() }).eq('id', reservationId).eq('settlement_status','eligible')
      throw error
    }
    await db.from('reservation_delivery_events').insert({ reservation_id:reservationId, event_type:'dispute_resolved_provider', actor_user_id:user.id, note:cleanNote })
    await Promise.all([
      notify(db, reservation.user_id, 'A contestação foi analisada. O serviço foi considerado prestado e o pagamento foi libertado ao prestador.', reservationId, 'released:athlete'),
      notify(db, providerId, 'A contestação foi resolvida a teu favor e o valor da reserva foi libertado.', reservationId, 'released:provider', '/dashboard/entregas'),
    ])
  } else {
    const { data: transaction, error: txError } = await db.from('transactions').select('id,stripe_charge_id,stripe_payment_intent_id,stripe_transfer_id').eq('source_id', reservationId).in('type',['service_reservation_payment','space_reservation_payment']).eq('status','completed').order('created_at',{ascending:false}).limit(1).maybeSingle()
    if (txError || !transaction) throw new Error('Transação financeira da reserva não encontrada.')
    if (transaction.stripe_transfer_id) throw new Error('O valor já foi transferido. Este caso exige reversão financeira manual antes do reembolso.')
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) throw new Error('Stripe não está configurado.')
    const stripe = new Stripe(secret)
    const chargeId = String(transaction.stripe_charge_id || '')
    const paymentIntentId = String(transaction.stripe_payment_intent_id || '')
    if (!chargeId.startsWith('ch_') && !paymentIntentId.startsWith('pi_')) throw new Error('Pagamento Stripe da reserva não encontrado.')
    const refund = await stripe.refunds.create({ ...(chargeId.startsWith('ch_') ? { charge:chargeId } : { payment_intent:paymentIntentId }), reason:'requested_by_customer', metadata:{ reservation_id:reservationId, resolution:'admin_dispute_refund' } }, { idempotencyKey:`reservation-dispute-refund:${reservationId}` })
    if (!['pending','succeeded'].includes(refund.status || '')) throw new Error('O Stripe não aceitou o reembolso.')
    const { error } = await db.from('reservations').update({ payment_status:'refunded', status:'cancelled', service_delivery_status:'cancelled', settlement_status:'refunded', updated_at:now }).eq('id', reservationId).eq('service_delivery_status','disputed').eq('settlement_status','blocked')
    if (error) throw error
    await db.from('reservation_delivery_events').insert({ reservation_id:reservationId, event_type:'dispute_resolved_refund', actor_user_id:user.id, note:cleanNote, metadata:{ stripe_refund_id:refund.id } })
    await Promise.all([
      notify(db, reservation.user_id, 'A contestação foi analisada e o reembolso da reserva foi iniciado.', reservationId, 'refunded:athlete'),
      notify(db, providerId, 'A contestação da reserva foi resolvida com reembolso ao atleta.', reservationId, 'refunded:provider', '/dashboard/entregas'),
    ])
  }

  revalidatePath('/admin/disputas')
  revalidatePath('/admin/faturacao')
  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard/reservas')
  revalidatePath('/dashboard/entregas')
  revalidatePath('/dashboard/confirmacoes')
  return { success:true }
}
