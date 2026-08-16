'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type AvailabilitySlotInput = {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

function normalizeTime(value: string) {
  const match = /^(\d{2}):(\d{2})/.exec(String(value || ''))
  if (!match) throw new Error('Horário inválido.')
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) throw new Error('Horário inválido.')
  return `${match[1]}:${match[2]}:00`
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function validateSlots(slots: AvailabilitySlotInput[]) {
  if (slots.length > 50) throw new Error('Existem demasiados períodos de disponibilidade.')
  const normalized = slots
    .filter(slot => slot.is_active)
    .map(slot => {
      const day = Number(slot.day_of_week)
      if (!Number.isInteger(day) || day < 0 || day > 6) throw new Error('Dia da semana inválido.')
      const start = normalizeTime(slot.start_time)
      const end = normalizeTime(slot.end_time)
      if (toMinutes(start) >= toMinutes(end)) throw new Error('A hora final tem de ser posterior à hora inicial.')
      return { day_of_week: day, start_time: start, end_time: end, is_active: true }
    })

  for (let day = 0; day <= 6; day += 1) {
    const daySlots = normalized
      .filter(slot => slot.day_of_week === day)
      .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time))
    for (let index = 1; index < daySlots.length; index += 1) {
      if (toMinutes(daySlots[index].start_time) < toMinutes(daySlots[index - 1].end_time)) {
        throw new Error('Existem períodos de disponibilidade sobrepostos no mesmo dia.')
      }
    }
  }

  return normalized
}

async function requireManagedRoom(roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')

  const admin = createAdminClient()
  const { data: room } = await admin
    .from('space_rooms')
    .select('id, space_id')
    .eq('id', roomId)
    .maybeSingle()
  if (!room) throw new Error('Sala/campo não encontrado.')

  const { data: space } = await admin
    .from('sport_spaces')
    .select('id')
    .eq('id', room.space_id)
    .eq('owner_user_id', user.id)
    .maybeSingle()
  if (!space) throw new Error('Não tem permissão para gerir esta sala/campo.')

  return { admin }
}

export async function getRoomAvailabilityAction(roomId: string) {
  const { admin } = await requireManagedRoom(roomId)
  const { data, error } = await admin
    .from('space_room_availability')
    .select('id, day_of_week, start_time, end_time, is_active')
    .eq('room_id', roomId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })
  if (error) throw new Error(error.message)
  return data || []
}

export async function saveRoomAvailabilityAction(roomId: string, slots: AvailabilitySlotInput[]) {
  const { admin } = await requireManagedRoom(roomId)
  const normalized = validateSlots(slots)

  const { data: previous, error: previousError } = await admin
    .from('space_room_availability')
    .select('day_of_week, start_time, end_time, is_active')
    .eq('room_id', roomId)
  if (previousError) throw new Error(previousError.message)

  const { error: deleteError } = await admin
    .from('space_room_availability')
    .delete()
    .eq('room_id', roomId)
  if (deleteError) throw new Error(deleteError.message)

  if (normalized.length) {
    const { error: insertError } = await admin
      .from('space_room_availability')
      .insert(normalized.map(slot => ({ room_id: roomId, ...slot })))

    if (insertError) {
      if (previous?.length) {
        await admin.from('space_room_availability').insert(previous.map(slot => ({ room_id: roomId, ...slot })))
      }
      throw new Error('Não foi possível guardar a disponibilidade. O horário anterior foi restaurado.')
    }
  }

  revalidatePath('/dashboard/espacos/salas')
  return { success: true, slots: normalized }
}
