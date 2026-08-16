'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

function toMinutes(value: string) {
  const [h, m] = value.split(':').map(Number)
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN
}

function addMinutes(value: string, duration: number) {
  const start = toMinutes(value)
  const total = start + duration
  if (!Number.isFinite(start) || total >= 1440) return null
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function missingRoomColumn(error: any) {
  const code = String(error?.code || '')
  const message = String(error?.message || '')
  return ['42703', 'PGRST204'].includes(code) || message.includes('space_room_id') || message.includes("Could not find the 'space_room_id' column")
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
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (Number.isNaN(bookingDate.getTime()) || bookingDate < today) throw new Error('A data da reserva é inválida.')

  let professionalId: string | null = null
  let serviceId: string | null = null
  let spaceId: string | null = null
  let roomId: string | null = null
  let duration = 60
  let amount = 0

  if (input.serviceId) {
    const { data: service, error } = await admin.from('services').select('id, professional_id, price, duration_minutes, is_active').eq('id', input.serviceId).maybeSingle()
    if (error || !service || !service.is_active) throw new Error('O serviço já não está disponível.')
    if (input.professionalId && input.professionalId !== service.professional_id) throw new Error('O serviço não pertence a este profissional.')
    amount = Number(service.price || 0)
    if (amount > 0) throw new Error('Esta reserva requer pagamento online.')
    professionalId = service.professional_id
    serviceId = service.id
    duration = Math.max(1, Number(service.duration_minutes || 60))
  } else if (input.spaceRoomId) {
    const { data: room, error } = await admin.from('space_rooms').select('id, space_id, price_per_hour, is_active').eq('id', input.spaceRoomId).maybeSingle()
    if (error || !room || !room.is_active) throw new Error('A sala/campo já não está disponível.')
    if (input.spaceId && input.spaceId !== room.space_id) throw new Error('A sala/campo não pertence a este espaço.')
    amount = Number(room.price_per_hour || 0)
    if (amount > 0) throw new Error('Esta reserva requer pagamento online.')
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
    const valid = (availability || []).some((slot: any) => startTime >= String(slot.start_time).slice(0,5) && endTime <= String(slot.end_time).slice(0,5))
    if (!valid) throw new Error('O horário escolhido está fora da disponibilidade do profissional.')
  }
  if (roomId) {
    const { data: availability, error } = await admin.from('space_room_availability').select('start_time,end_time').eq('room_id', roomId).eq('day_of_week', dayOfWeek).eq('is_active', true)
    if (error) throw new Error('Não foi possível validar a disponibilidade da sala/campo.')
    const valid = (availability || []).some((slot: any) => startTime >= String(slot.start_time).slice(0,5) && endTime <= String(slot.end_time).slice(0,5))
    if (!valid) throw new Error('O horário escolhido está fora da disponibilidade da sala/campo.')
  }

  const baseOverlap = () => admin.from('reservations').select('id').eq('date', date).in('status', ['pending','paid','confirmed']).lt('start_time', endTime).gt('end_time', startTime)
  let conflictResult
  if (professionalId) conflictResult = await baseOverlap().eq('professional_id', professionalId).limit(1)
  else if (roomId) {
    conflictResult = await baseOverlap().eq('space_room_id', roomId).limit(1)
    if (conflictResult.error && missingRoomColumn(conflictResult.error)) {
      conflictResult = await baseOverlap().eq('space_id', spaceId!).limit(1)
    }
  } else conflictResult = await baseOverlap().limit(1)

  if (conflictResult.error) throw new Error(`Não foi possível validar conflitos da agenda: ${conflictResult.error.message}`)
  if (conflictResult.data?.length) throw new Error('Este horário acabou de ficar indisponível.')

  const basePayload: Record<string, unknown> = { user_id: user.id, professional_id: professionalId, service_id: serviceId, space_id: spaceId, date, start_time: startTime, end_time: endTime, amount: 0, status: 'confirmed', payment_status: 'paid' }
  if (roomId) basePayload.space_room_id = roomId

  let insertResult = await admin.from('reservations').insert(basePayload).select('id').single()
  if (insertResult.error && roomId && missingRoomColumn(insertResult.error)) {
    const { space_room_id: _ignored, ...legacyPayload } = basePayload
    insertResult = await admin.from('reservations').insert(legacyPayload).select('id').single()
  }

  if (insertResult.error || !insertResult.data) {
    console.error('Free reservation insert error:', insertResult.error)
    throw new Error(insertResult.error?.message ? `Não foi possível criar a reserva: ${insertResult.error.message}` : 'Não foi possível criar a reserva.')
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard/reservas')
  return { success: true, id: insertResult.data.id }
}
