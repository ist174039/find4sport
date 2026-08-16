import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarCheck, MessageSquare, UserRound, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

type ClientSummary = {
  id: string
  name: string
  avatar?: string | null
  totalBookings: number
  completed: number
  pending: number
  cancelled: number
  totalAmount: number
  lastBooking: string
  lastStatus: string
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/clientes')
  const access = await resolveSessionAccess(supabase, user)
  if (!access || !['professional', 'venue_manager'].includes(access.role || '')) redirect('/dashboard')

  let reservations: any[] = []
  if (access.role === 'professional') {
    const { data: professional } = await supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
    if (professional) reservations = (await supabase.from('reservations').select('id, user_id, status, amount, date, created_at, user:platform_users!reservations_user_id_fkey(id, full_name, avatar_url)').eq('professional_id', professional.id).order('created_at', { ascending: false })).data || []
  } else {
    const { data: spaces } = await supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id)
    const ids = (spaces || []).map(space => space.id)
    if (ids.length) reservations = (await supabase.from('reservations').select('id, user_id, status, amount, date, created_at, user:platform_users!reservations_user_id_fkey(id, full_name, avatar_url)').in('space_id', ids).order('created_at', { ascending: false })).data || []
  }

  const map = new Map<string, ClientSummary>()
  for (const reservation of reservations) {
    if (!reservation.user?.id) continue
    const when = reservation.created_at || reservation.date
    const current = map.get(reservation.user.id) || {
      id: reservation.user.id,
      name: reservation.user.full_name || 'Cliente',
      avatar: reservation.user.avatar_url,
      totalBookings: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
      totalAmount: 0,
      lastBooking: when,
      lastStatus: reservation.status || 'pending',
    }
    current.totalBookings += 1
    current.totalAmount += Number(reservation.amount || 0)
    if (reservation.status === 'completed') current.completed += 1
    if (reservation.status === 'pending') current.pending += 1
    if (reservation.status === 'cancelled') current.cancelled += 1
    if (new Date(when).getTime() > new Date(current.lastBooking).getTime()) {
      current.lastBooking = when
      current.lastStatus = reservation.status || current.lastStatus
    }
    map.set(current.id, current)
  }

  const clients = [...map.values()].sort((a, b) => new Date(b.lastBooking).getTime() - new Date(a.lastBooking).getTime())
  const totalCompleted = clients.reduce((sum, client) => sum + client.completed, 0)
  const pendingReservations = clients.reduce((sum, client) => sum + client.pending, 0)
  const totalAmount = clients.reduce((sum, client) => sum + client.totalAmount, 0)

  return (
    <DashboardPage>
      <DashboardPageHeader title="Clientes" description="Clientes derivados exclusivamente de reservas reais. Não existem segmentos VIP, inatividade ou clientes adicionados apenas no browser." />

      <DashboardStatGrid>
        <DashboardStat label="Clientes" value={clients.length} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Reservas concluídas" value={totalCompleted} icon={<CalendarCheck className="h-5 w-5" />} />
        <DashboardStat label="Pendentes" value={pendingReservations} icon={<CalendarCheck className="h-5 w-5" />} />
        <DashboardStat label="Valor registado" value={new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalAmount)} icon={<UserRound className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection title="Relações com clientes" description="Histórico agregado por utilizador a partir das reservas do profissional ou espaço.">
        {clients.length === 0 ? <DashboardEmptyState icon={<Users className="h-10 w-10" />} title="Sem clientes" description="Os clientes aparecerão automaticamente quando existirem reservas associadas." /> : <div className="grid gap-3 md:grid-cols-2">{clients.map(client => <article key={client.id} className="rounded-2xl border border-border p-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">{client.avatar ? <img src={client.avatar} alt="" className="h-full w-full object-cover" /> : client.name.charAt(0)}</div><div className="min-w-0"><p className="truncate font-semibold">{client.name}</p><p className="text-xs text-muted-foreground">Última reserva: {new Date(client.lastBooking).toLocaleDateString('pt-PT')}</p></div></div><Badge variant="outline">{client.lastStatus}</Badge></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-muted/40 p-2"><p className="text-lg font-bold">{client.totalBookings}</p><p className="text-[10px] uppercase text-muted-foreground">Reservas</p></div><div className="rounded-xl bg-muted/40 p-2"><p className="text-lg font-bold">{client.completed}</p><p className="text-[10px] uppercase text-muted-foreground">Concluídas</p></div><div className="rounded-xl bg-muted/40 p-2"><p className="text-sm font-bold">{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(client.totalAmount)}</p><p className="text-[10px] uppercase text-muted-foreground">Valor</p></div></div><div className="mt-3"><Button asChild variant="outline" className="min-h-11 w-full"><Link href={`/dashboard/mensagens?user=${client.id}`}><MessageSquare className="mr-2 h-4 w-4" />Mensagem</Link></Button></div></article>)}</div>}
      </DashboardSection>
    </DashboardPage>
  )
}
