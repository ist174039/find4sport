import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Calendar, CalendarCheck, Clock, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

type AgendaItem = {
  id: string
  kind: 'event' | 'reservation'
  title: string
  at: Date
  endAt?: Date | null
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

  const { data: events } = await supabase
    .from('events')
    .select('id, title, start_date, end_date, address, status')
    .eq('created_by', user.id)
    .order('start_date', { ascending: true })

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
    ...(events || []).map(event => ({
      id: `event-${event.id}`,
      kind: 'event' as const,
      title: event.title,
      at: new Date(event.start_date),
      endAt: event.end_date ? new Date(event.end_date) : null,
      status: event.status,
      location: event.address,
      href: `/eventos/${event.id}`,
    })),
    ...reservations.map(reservation => ({
      id: `reservation-${reservation.id}`,
      kind: 'reservation' as const,
      title: `Reserva · ${reservation.user?.full_name || 'Cliente'}`,
      at: new Date(`${reservation.date}T${reservation.start_time}`),
      endAt: reservation.end_time ? new Date(`${reservation.date}T${reservation.end_time}`) : null,
      status: reservation.status,
      href: '/dashboard/reservas',
    })),
  ].filter(item => !Number.isNaN(item.at.getTime())).sort((a, b) => a.at.getTime() - b.at.getTime())

  const now = new Date()
  const upcoming = items.filter(item => item.at >= now)
  const today = items.filter(item => item.at.toDateString() === now.toDateString())
  const reservationCount = items.filter(item => item.kind === 'reservation').length
  const eventCount = items.filter(item => item.kind === 'event').length

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Agenda"
        description="Linha temporal de reservas e eventos. Alterações de estado são feitas nos módulos Reservas ou Eventos, onde vivem as regras de negócio."
        action={<Button asChild variant="outline" className="min-h-11"><Link href="/dashboard/reservas">Gerir reservas</Link></Button>}
      />

      <DashboardStatGrid>
        <DashboardStat label="Hoje" value={today.length} icon={<Clock className="h-5 w-5" />} />
        <DashboardStat label="Próximos" value={upcoming.length} icon={<Calendar className="h-5 w-5" />} />
        <DashboardStat label="Reservas" value={reservationCount} icon={<CalendarCheck className="h-5 w-5" />} />
        <DashboardStat label="Eventos" value={eventCount} icon={<Calendar className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection title="Próximos compromissos" description="Ordenação cronológica, otimizada para consulta rápida em mobile.">
        {upcoming.length === 0 ? <DashboardEmptyState icon={<Calendar className="h-10 w-10" />} title="Agenda livre" description="Não existem reservas ou eventos futuros registados." /> : <div className="space-y-3">{upcoming.slice(0, 50).map(item => <Link key={item.id} href={item.href} className="flex flex-col gap-3 rounded-2xl border border-border p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary"><span className="text-sm font-bold">{item.at.getDate()}</span><span className="text-[10px] uppercase">{item.at.toLocaleDateString('pt-PT', { month: 'short' })}</span></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.title}</p><Badge variant="outline">{item.kind === 'reservation' ? 'Reserva' : 'Evento'}</Badge></div><p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" />{item.at.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}{item.endAt ? ` – ${item.endAt.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` : ''}</p>{item.location && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /><span className="truncate">{item.location}</span></p>}</div></div><Badge className="self-start sm:self-center" variant="secondary">{item.status}</Badge></Link>)}</div>}
      </DashboardSection>
    </DashboardPage>
  )
}
