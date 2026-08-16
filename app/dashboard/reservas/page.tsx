import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { ReservationsClient } from './reservations-client'

export default async function ReservasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/reservas')

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !['professional', 'venue_manager'].includes(access.role)) redirect('/dashboard')

  if (access.role === 'professional') {
    const { data: professional } = await supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
    if (!professional) redirect('/auth/registar/profissional')

    const [{ data: reservations = [] }, { data: availability = [] }] = await Promise.all([
      supabase
        .from('reservations')
        .select('*, service:services(name), user:platform_users(id, full_name, avatar_url, type)')
        .eq('professional_id', professional.id)
        .order('date', { ascending: false }),
      supabase
        .from('professional_availability')
        .select('day_of_week, start_time, end_time, is_active')
        .eq('professional_id', professional.id),
    ])

    return <ReservationsClient role="professional" initialReservations={reservations || []} initialAvailability={availability || []} />
  }

  const { data: spaces = [] } = await supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id)
  const spaceIds = (spaces || []).map((space: any) => space.id)
  if (!spaceIds.length) redirect('/auth/registar/espaco')

  const { data: reservations = [] } = await supabase
    .from('reservations')
    .select('*, service:services(name), user:platform_users(id, full_name, avatar_url, type)')
    .in('space_id', spaceIds)
    .order('date', { ascending: false })

  return <ReservationsClient role="venue_manager" initialReservations={reservations || []} initialAvailability={[]} />
}
