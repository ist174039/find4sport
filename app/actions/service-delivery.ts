'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { autoConfirmAtFromNow, canMarkDelivered, releaseReservationSettlement } from '@/lib/billing/reservation-settlement'

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')
  return user
}

async function reservationProviderUserId(db: any, reservation: { professional_id?: string | null; space_id?: string | null }) {
  if (reservation.professional_id) return (await db.from('professionals').select('user_id').eq('id', reservation.professional_id).maybeSingle()).data?.user_id || null
  if (reservation.space_id) return (await db.from('sport_spaces').select('owner_user_id').eq('id', reservation.space_id).maybeSingle()).data?.owner_user_id || null
  return null
}

async function pushNotification(db: any, userId: string | null, message: string, link: string, dedupeKey: string, reservationId: string) {
  if (!userId) return
  await db.from('notifications').insert({ user_id: userId, type: 'reservation', message, link, data: { reservation_id: reservationId }, dedupe_key: dedupeKey })
}

export async function markReservationDeliveredAction(id: string) {
  const actor = await requireUser()
  const db = createAdminClient() as any
  const { data: reservation } = await db.from('reservations').select('id,user_id,professional_id,space_id,date,end_time,payment_status,service_delivery_status').eq('id', id).maybeSingle()
  if (!reservation) throw new Error('Reserva não encontrada.')
  const owner = await reservationProviderUserId(db, reservation)
  if (owner !== actor.id) throw new Error('Sem permissão.')
  if (reservation.payment_status !== 'paid' || reservation.service_delivery_status !== 'scheduled') throw new Error('A prestação não pode ser concluída neste estado.')
  if (!canMarkDelivered(reservation)) throw new Error('Só podes marcar como prestado depois do fim da reserva.')

  const now = new Date().toISOString()
  const { data: updated, error } = await db.from('reservations').update({
    service_delivery_status: 'awaiting_customer_confirmation',
    settlement_status: 'held',
    provider_marked_completed_at: now,
    auto_confirm_after: autoConfirmAtFromNow(),
    updated_at: now,
  }).eq('id', id).eq('service_delivery_status', 'scheduled').select('id').maybeSingle()
  if (error || !updated) throw new Error(error?.message || 'Falha ao atualizar a prestação.')

  await db.from('reservation_delivery_events').insert({ reservation_id: id, event_type: 'provider_marked_delivered', actor_user_id: actor.id })
  await pushNotification(db, reservation.user_id, 'O prestador marcou o serviço como realizado. Confirma a prestação ou reporta um problema nas próximas 48 horas.', '/dashboard/confirmacoes', `delivery:${id}:awaiting`, id)
  revalidatePath('/dashboard/reservas')
  revalidatePath('/dashboard/confirmacoes')
  return { success: true }
}

export async function confirmReservationDeliveryAction(id: string) {
  const actor = await requireUser()
  const db = createAdminClient() as any
  const { data: reservation } = await db.from('reservations').select('id,user_id,professional_id,space_id').eq('id', id).eq('user_id', actor.id).maybeSingle()
  if (!reservation) throw new Error('Reserva não encontrada.')
  const providerId = await reservationProviderUserId(db, reservation)
  const now = new Date().toISOString()
  const { data: updated, error } = await db.from('reservations').update({
    service_delivery_status: 'completed',
    settlement_status: 'eligible',
    athlete_confirmed_at: now,
    status: 'completed',
    updated_at: now,
  }).eq('id', id).eq('user_id', actor.id).eq('service_delivery_status', 'awaiting_customer_confirmation').eq('settlement_status', 'held').select('id').maybeSingle()
  if (error || !updated) throw new Error(error?.message || 'Já não está disponível para confirmação.')

  await db.from('reservation_delivery_events').insert({ reservation_id: id, event_type: 'athlete_confirmed', actor_user_id: actor.id })
  let settlementPending = false
  try {
    await releaseReservationSettlement(id)
  } catch (settlementError) {
    settlementPending = true
    await db.from('reservation_delivery_events').insert({ reservation_id: id, event_type: 'settlement_retry_pending', metadata: { message: settlementError instanceof Error ? settlementError.message.slice(0, 500) : 'unknown' } })
  }
  await pushNotification(db, providerId, settlementPending ? 'O atleta confirmou o serviço. O pagamento está elegível e será novamente processado automaticamente.' : 'O atleta confirmou o serviço e o pagamento foi libertado.', '/dashboard/reservas', `delivery:${id}:confirmed:provider`, id)
  revalidatePath('/dashboard/confirmacoes')
  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard/reservas')
  return { success: true, settlementPending }
}

export async function disputeReservationDeliveryAction(id: string, reason: string) {
  const actor = await requireUser()
  const clean = String(reason || '').trim()
  if (clean.length < 10 || clean.length > 2000) throw new Error('Descreve o problema entre 10 e 2000 caracteres.')
  const db = createAdminClient() as any
  const { data: reservation } = await db.from('reservations').select('id,user_id,professional_id,space_id').eq('id', id).eq('user_id', actor.id).maybeSingle()
  if (!reservation) throw new Error('Reserva não encontrada.')
  const providerId = await reservationProviderUserId(db, reservation)
  const now = new Date().toISOString()
  const { data: updated, error } = await db.from('reservations').update({
    service_delivery_status: 'disputed',
    settlement_status: 'blocked',
    dispute_opened_at: now,
    dispute_reason: clean,
    updated_at: now,
  }).eq('id', id).eq('user_id', actor.id).eq('service_delivery_status', 'awaiting_customer_confirmation').eq('settlement_status', 'held').select('id').maybeSingle()
  if (error || !updated) throw new Error(error?.message || 'Já não está disponível para contestação.')

  await db.from('reservation_delivery_events').insert({ reservation_id: id, event_type: 'athlete_disputed', actor_user_id: actor.id, note: clean })
  const { data: admins } = await db.from('admins').select('auth_user_id')
  await Promise.all([
    pushNotification(db, providerId, 'O atleta reportou um problema nesta prestação. O pagamento ficou bloqueado até revisão administrativa.', '/dashboard/reservas', `delivery:${id}:disputed:provider`, id),
    ...(admins || []).map((admin: { auth_user_id?: string | null }) => pushNotification(db, admin.auth_user_id || null, 'Nova contestação de serviço aguarda decisão administrativa.', '/admin/disputas', `delivery:${id}:disputed:admin:${admin.auth_user_id}`, id)),
  ])
  revalidatePath('/dashboard/confirmacoes')
  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard/reservas')
  revalidatePath('/admin/disputas')
  return { success: true }
}
