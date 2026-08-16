import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Calendar, CalendarCheck, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { AgendaCalendar } from '@/components/dashboard/agenda-calendar'

type AgendaItem = {
  id: string
  kind: 'event' | 'reservation'
  title: string
  at: string
  endAt?: string | null
  status: string
  location?: string | null
  href: string
}

export default async function DashboardAgendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/agenda')
  const access = await resolveSessionAccess(supabase, user)
  if (!access || !['professional', 'venue_manager'].includes(access.role || '')) redirect('/dashboard')

  const { data: events } = await supabase.from('events').select('id, title, start_date, end_date, address, status').eq('created_by', user.id).order('start_date', { ascending: true })

  let reservations: any[] = []
  if (access.role === 'professional') {
    const { data: professional } = await supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
    if (professional) reservations = (await supabase.from('reservations').select('id, date, start_time, end_time, status, user:platform_users(full_name)').eq('professional_id', professional.id).order('date', { ascending: true })).data || []
  } else {
    const { data: spaces } = await supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id)
    const ids = (spaces || []).map(space => space.id)
    if (ids.length) reservations = (await supabase.from('reservations').select('id, date, start_time, end_time, status, user:platform_users(full_name)').in('space_id', ids).order('date', { ascending: true })).data || []
  }

  const items: AgendaItem[] = [
    ...(events || []).map(event => ({ id: `event-${event.id}`, kind: 'event' as const, title: event.title, at: new Date(event.start_date).toISOString(), endAt: event.end_date ? new Date(event.end_date).toISOString() : null, status: event.status, location: event.address, href: `/eventos/${event.id}` })),
    ...reservations.map(reservation => ({ id: `reservation-${reservation.id}`, kind: 'reservation' as const, title: `Reserva · ${reservation.user?.full_name || 'Cliente'}`, at: new Date(`${reservation.date}T${String(reservation.start_time).slice(0, 8)}`).toISOString(), endAt: reservation.end_time ? new Date(`${reservation.date}T${String(reservation.end_time).slice(0, 8)}`).toISOString() : null, status: reservation.status, href: '/dashboard/reservas' })),
  ].filter(item => !Number.isNaN(new Date(item.at).getTime())).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

  const now = new Date()
  const today = items.filter(item => new Date(item.at).toDateString() === now.toDateString())
  const upcoming = items.filter(item => new Date(item.at) >= now)
  const reservationCount = items.filter(item => item.kind === 'reservation').length
  const eventCount = items.filter(item => item.kind === 'event').length

  return (
    <DashboardPage>
      <DashboardPageHeader title="Agenda" description="Vista diária, semanal e mensal de reservas e eventos. As alterações de estado continuam nos módulos próprios." action={<Button asChild variant="outline" className="min-h-11"><Link href="/dashboard/reservas">Gerir reservas</Link></Button>} />
      <DashboardStatGrid>
        <DashboardStat label="Hoje" value={today.length} icon={<Clock className="h-5 w-5" />} />
        <DashboardStat label="Próximos" value={upcoming.length} icon={<Calendar className="h-5 w-5" />} />
        <DashboardStat label="Reservas" value={reservationCount} icon={<CalendarCheck className="h-5 w-5" />} />
        <DashboardStat label="Eventos" value={eventCount} icon={<Calendar className="h-5 w-5" />} />
      </DashboardStatGrid>
      <DashboardSection title="Calendário" description="Alterna entre Dia, Semana e Mês. No mês, toca num dia para abrir a vista diária.">
        <AgendaCalendar items={items} />
      </DashboardSection>
    </DashboardPage>
  )
}
