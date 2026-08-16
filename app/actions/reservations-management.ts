'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'

async function getProviderContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária.')

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !['professional', 'venue_manager'].includes(access.role)) {
    throw new Error('Esta operação é exclusiva de profissionais e gestores de espaço.')
  }

  return { user, role: access.role, admin: createAdminClient() }
}

export async function updateProviderReservationStatusAction(
  reservationId: string,
  newStatus: 'confirmed' | 'cancelled',
) {
  const { user, role, admin } = await getProviderContext()
  const { data: reservation } = await admin
    .from('reservations')
    .select('id, professional_id, space_id, status')
    .eq('id', reservationId)
    .maybeSingle()

  if (!reservation) throw new Error('Reserva não encontrada.')

  let authorized = false
  if (role === 'professional' && reservation.professional_id) {
    const { data } = await admin.from('professionals').select('id').eq('id', reservation.professional_id).eq('user_id', user.id).maybeSingle()
    authorized = Boolean(data)
  }
  if (role === 'venue_manager' && reservation.space_id) {
    const { data } = await admin.from('sport_spaces').select('id').eq('id', reservation.space_id).eq('owner_user_id', user.id).maybeSingle()
    authorized = Boolean(data)
  }
  if (!authorized) throw new Error('Não tem permissão para alterar esta reserva.')

  if (!['pending', 'paid', 'confirmed'].includes(reservation.status)) {
    throw new Error('Esta reserva já não pode ser alterada.')
  }

  const { error } = await admin.from('reservations').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', reservation.id)
  if (error) throw new Error('Não foi possível atualizar a reserva.')

  revalidatePath('/dashboard/reservas')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function saveProfessionalAvailabilityAction(items: Array<{
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}>) {
  const { user, role, admin } = await getProviderContext()
  if (role !== 'professional') throw new Error('A disponibilidade desta página aplica-se apenas a profissionais.')

  const { data: professional } = await admin.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
  if (!professional) throw new Error('Perfil profissional não encontrado.')

  if (!Array.isArray(items) || items.length !== 7) throw new Error('Horário inválido.')
  const normalized = items.map((item) => {
    if (!Number.isInteger(item.day_of_week) || item.day_of_week < 0 || item.day_of_week > 6) throw new Error('Dia da semana inválido.')
    if (!/^\d{2}:\d{2}$/.test(item.start_time) || !/^\d{2}:\d{2}$/.test(item.end_time)) throw new Error('Formato de hora inválido.')
    if (item.is_active && item.start_time >= item.end_time) throw new Error('A hora de início deve ser anterior à hora de fim.')
    return {
      professional_id: professional.id,
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      is_active: Boolean(item.is_active),
    }
  })

  const { error } = await admin.from('professional_availability').upsert(normalized, { onConflict: 'professional_id,day_of_week' })
  if (error) throw new Error('Não foi possível guardar a disponibilidade.')

  revalidatePath('/dashboard/reservas')
  revalidatePath('/dashboard/agenda')
  return { success: true }
}
