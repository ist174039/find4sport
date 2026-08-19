'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { TablesInsert } from '@/lib/supabase-types'
import { revalidatePath } from 'next/cache'

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : NaN
}

function addMinutes(value: string, duration: number) {
  const start = toMinutes(value)
  const total = start + duration
  if (!Number.isFinite(start) || total >= 1440) return null
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function slotContains(startTime: string, endTime: string, slot: { start_time: string; end_time: string }) {
  return startTime >= String(slot.start_time).slice(0, 5) && endTime <= String(slot.end_time).slice(0, 5)
}

async function assertProfessionalSlot(admin: ReturnType<typeof createAdminClient>, professionalId: string, date: string, startTime: string, duration: number) {
  const bookingDate = new Date(`${date}T12:00:00`)
  const endTime = addMinutes(startTime, duration)
  if (!endTime) throw new Error('Intervalo horário inválido.')

  const { data: availability, error } = await admin
    .from('professional_availability')
    .select('start_time,end_time')
    .eq('professional_id', professionalId)
    .eq('day_of_week', bookingDate.getDay())
    .eq('is_active', true)
  if (error) throw new Error('Não foi possível validar a disponibilidade do profissional.')
  if (!(availability || []).some(slot => slotContains(startTime, endTime, slot))) throw new Error('O horário escolhido está fora da disponibilidade do profissional.')

  const { data: conflicts, error: conflictError } = await admin
    .from('reservations')
    .select('id')
    .eq('professional_id', professionalId)
    .eq('date', date)
    .in('status', ['pending', 'paid', 'confirmed'])
    .lt('start_time', endTime)
    .gt('end_time', startTime)
    .limit(1)
  if (conflictError) throw new Error(`Não foi possível validar conflitos da agenda: ${conflictError.message}`)
  if (conflicts?.length) throw new Error('Este horário acabou de ficar indisponível.')
  return endTime
}

export async function createPackageReservationAction(input: { serviceId: string; professionalId: string; packagePurchaseId: string; date: string; startTime: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Precisas de iniciar sessão para reservar.')

  const admin = createAdminClient()
  const { data: service, error: serviceError } = await admin.from('services').select('id,professional_id,duration_minutes,is_active').eq('id', input.serviceId).maybeSingle()
  if (serviceError || !service || !service.is_active || service.professional_id !== input.professionalId) throw new Error('Serviço indisponível.')

  const { data: purchase, error: purchaseError } = await admin
    .from('service_package_purchases')
    .select('id,user_id,service_id,professional_id,sessions_remaining,status,expires_at')
    .eq('id', input.packagePurchaseId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (purchaseError || !purchase) throw new Error('Pacote de sessões não encontrado.')
  if (purchase.status !== 'active' || Number(purchase.sessions_remaining) <= 0) throw new Error('Este pacote já não tem sessões disponíveis.')
  if (purchase.service_id !== service.id || purchase.professional_id !== service.professional_id) throw new Error('Este pacote não é válido para o serviço selecionado.')
  if (purchase.expires_at && new Date(purchase.expires_at).getTime() <= Date.now()) throw new Error('Este pacote expirou.')

  const date = String(input.date || '')
  const startTime = String(input.startTime || '').slice(0, 5)
  if (!date || !startTime) throw new Error('Seleciona uma data e hora válidas.')
  const bookingDate = new Date(`${date}T12:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (Number.isNaN(bookingDate.getTime()) || bookingDate < today) throw new Error('A data da reserva é inválida.')

  const endTime = await assertProfessionalSlot(admin, service.professional_id, date, startTime, Math.max(1, Number(service.duration_minutes || 60)))
  const payload: TablesInsert<'reservations'> = {
    user_id: user.id,
    professional_id: service.professional_id,
    service_id: service.id,
    date,
    start_time: startTime,
    end_time: endTime,
    amount: 0,
    status: 'confirmed',
    payment_status: 'paid',
    package_purchase_id: purchase.id,
    package_session_consumed: true,
  }
  const { data: reservation, error: reservationError } = await admin.from('reservations').insert(payload).select('id').single()
  if (reservationError || !reservation) throw new Error(reservationError?.message || 'Não foi possível criar a reserva com o pacote.')

  const remaining = Number(purchase.sessions_remaining) - 1
  const { data: updatedPurchase, error: consumeError } = await admin
    .from('service_package_purchases')
    .update({ sessions_remaining: remaining, status: remaining === 0 ? 'exhausted' : 'active', updated_at: new Date().toISOString() })
    .eq('id', purchase.id)
    .eq('sessions_remaining', purchase.sessions_remaining)
    .select('id')
    .maybeSingle()
  if (consumeError || !updatedPurchase) {
    await admin.from('reservations').delete().eq('id', reservation.id).eq('package_purchase_id', purchase.id)
    throw new Error('O saldo do pacote foi alterado entretanto. Tenta novamente.')
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard/compras')
  revalidatePath('/dashboard/reservas')
  return { success: true, id: reservation.id, sessionsRemaining: remaining }
}

export async function createFreeReservationAction(input: { serviceId?: string | null; professionalId?: string | null; spaceId?: string | null; spaceRoomId?: string | null; date: string; startTime: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Precisas de iniciar sessão para reservar.')

  const admin = createAdminClient()
  const date = String(input.date || '')
  const startTime = String(input.startTime || '').slice(0, 5)
  if (!date || !startTime) throw new Error('Seleciona uma data e hora válidas.')

  const bookingDate = new Date(`${date}T12:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (Number.isNaN(bookingDate.getTime()) || bookingDate < today) throw new Error('A data da reserva é inválida.')

  let professionalId: string | null = null
  let serviceId: string | null = null
  let spaceId: string | null = null
  let roomId: string | null = null
  let duration = 60

  if (input.serviceId) {
    const { data: service, error } = await admin.from('services').select('id, professional_id, price, duration_minutes, is_active').eq('id', input.serviceId).maybeSingle()
    if (error || !service || !service.is_active) throw new Error('O serviço já não está disponível.')
    if (input.professionalId && input.professionalId !== service.professional_id) throw new Error('O serviço não pertence a este profissional.')
    if (Number(service.price || 0) > 0) throw new Error('Esta reserva requer pagamento online.')
    professionalId = service.professional_id
    serviceId = service.id
    duration = Math.max(1, Number(service.duration_minutes || 60))
  } else if (input.spaceRoomId) {
    const { data: room, error } = await admin.from('space_rooms').select('id, space_id, price_per_hour, is_active').eq('id', input.spaceRoomId).maybeSingle()
    if (error || !room || !room.is_active) throw new Error('A sala/campo já não está disponível.')
    if (input.spaceId && input.spaceId !== room.space_id) throw new Error('A sala/campo não pertence a este espaço.')
    if (Number(room.price_per_hour || 0) > 0) throw new Error('Esta reserva requer pagamento online.')
    spaceId = room.space_id
    roomId = room.id
  } else {
    throw new Error('Seleciona um serviço ou uma sala/campo.')
  }

  const endTime = addMinutes(startTime, duration)
  if (!endTime) throw new Error('O intervalo escolhido ultrapassa o fim do dia.')
  const dayOfWeek = bookingDate.getDay()

  if (professionalId) {
    const { data: availability, error } = await admin.from('professional_availability').select('start_time,end_time').eq('professional_id', professionalId).eq('day_of_week', dayOfWeek).eq('is_active', true)
    if (error) throw new Error('Não foi possível validar a disponibilidade do profissional.')
    if (!(availability || []).some(slot => slotContains(startTime, endTime, slot))) throw new Error('O horário escolhido está fora da disponibilidade do profissional.')
  }
  if (roomId) {
    const { data: availability, error } = await admin.from('space_room_availability').select('start_time,end_time').eq('room_id', roomId).eq('day_of_week', dayOfWeek).eq('is_active', true)
    if (error) throw new Error('Não foi possível validar a disponibilidade da sala/campo.')
    if (!(availability || []).some(slot => slotContains(startTime, endTime, slot))) throw new Error('O horário escolhido está fora da disponibilidade da sala/campo.')
  }

  const baseOverlap = () => admin.from('reservations').select('id').eq('date', date).in('status', ['pending', 'paid', 'confirmed']).lt('start_time', endTime).gt('end_time', startTime)
  const conflictResult = professionalId
    ? await baseOverlap().eq('professional_id', professionalId).limit(1)
    : roomId
      ? await baseOverlap().eq('space_room_id', roomId).limit(1)
      : await baseOverlap().limit(1)
  if (conflictResult.error) throw new Error(`Não foi possível validar conflitos da agenda: ${conflictResult.error.message}`)
  if (conflictResult.data?.length) throw new Error('Este horário acabou de ficar indisponível.')

  const payload: TablesInsert<'reservations'> = {
    user_id: user.id,
    professional_id: professionalId,
    service_id: serviceId,
    space_id: spaceId,
    space_room_id: roomId,
    date,
    start_time: startTime,
    end_time: endTime,
    amount: 0,
    status: 'confirmed',
    payment_status: 'paid',
  }
  const { data: reservation, error: insertError } = await admin.from('reservations').insert(payload).select('id').single()
  if (insertError || !reservation) {
    console.error('Free reservation insert error:', insertError)
    throw new Error(insertError?.message ? `Não foi possível criar a reserva: ${insertError.message}` : 'Não foi possível criar a reserva.')
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard/reservas')
  return { success: true, id: reservation.id }
}
