import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Calendar, Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { isProviderRole } from '@/lib/auth/roles'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { EventParticipantAttendanceButton } from '@/components/dashboard/event-participant-attendance-button'

const PAGE_SIZE = 30
const participantStatuses = ['pending', 'confirmed', 'paid', 'cancelled', 'attended'] as const
const statusLabels: Record<string, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', paid: 'Pago', cancelled: 'Cancelado', attended: 'Participou',
}
const paymentLabels: Record<string, string> = {
  free: 'Grátis', pending: 'Pagamento pendente', paid: 'Pago', refunded: 'Reembolsado', refund_pending: 'Reembolso pendente',
}

function href(eventId: string, page: number, q: string, status: string) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (q) params.set('q', q)
  if (status !== 'all') params.set('status', status)
  return `/dashboard/eventos/${eventId}/participantes${params.toString() ? `?${params}` : ''}`
}

export default async function EventParticipantsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=${encodeURIComponent(`/dashboard/eventos/${id}/participantes`)}`)
  const access = await resolveSessionAccess(supabase, user)
  if (!access || !isProviderRole(access.role)) redirect('/dashboard/eventos')

  const admin = createAdminClient()
  const { data: event, error: eventError } = await admin
    .from('events')
    .select('id,title,start_date,capacity,created_by')
    .eq('id', id)
    .eq('created_by', user.id)
    .maybeSingle()
  if (eventError || !event) redirect('/dashboard/eventos')

  const raw = await searchParams
  const page = Math.max(1, Number(Array.isArray(raw.page) ? raw.page[0] : raw.page) || 1)
  const q = String(Array.isArray(raw.q) ? raw.q[0] : raw.q || '').trim().replace(/[,%]/g, '').slice(0, 100)
  const requestedStatus = String(Array.isArray(raw.status) ? raw.status[0] : raw.status || 'all')
  const status = participantStatuses.includes(requestedStatus as typeof participantStatuses[number]) ? requestedStatus : 'all'
  const from = (page - 1) * PAGE_SIZE

  let matchingUserIds: string[] | null = null
  if (q) {
    const { data: users, error: usersError } = await admin
      .from('platform_users')
      .select('id')
      .ilike('full_name', `%${q}%`)
      .limit(1000)
    if (usersError) throw new Error('Não foi possível pesquisar participantes.')
    matchingUserIds = (users || []).map(item => item.id)
  }

  let rows: Array<{ id: string; user_id: string; status: string; payment_status: string; amount: number | null; ticket_type_id: string | null; created_at: string }> = []
  let total = 0
  if (!matchingUserIds || matchingUserIds.length > 0) {
    let query = admin
      .from('event_participants')
      .select('id,user_id,status,payment_status,amount,ticket_type_id,created_at', { count: 'exact' })
      .eq('event_id', id)
      .order('created_at', { ascending: false })
    if (status !== 'all') query = query.eq('status', status)
    if (matchingUserIds) query = query.in('user_id', matchingUserIds)
    const result = await query.range(from, from + PAGE_SIZE - 1)
    if (result.error) throw new Error('Não foi possível carregar os participantes.')
    rows = result.data || []
    total = result.count || 0
  }

  const userIds = [...new Set(rows.map(row => row.user_id))]
  const ticketIds = [...new Set(rows.map(row => row.ticket_type_id).filter((value): value is string => Boolean(value)))]
  const [{ data: profiles }, { data: tickets }, { count: attendedCount }, { count: activeCount }] = await Promise.all([
    userIds.length ? admin.from('platform_users').select('id,full_name,avatar_url').in('id', userIds) : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null; avatar_url: string | null }> }),
    ticketIds.length ? admin.from('event_ticket_types').select('id,name').in('id', ticketIds) : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
    admin.from('event_participants').select('id', { count: 'exact', head: true }).eq('event_id', id).eq('status', 'attended'),
    admin.from('event_participants').select('id', { count: 'exact', head: true }).eq('event_id', id).in('status', ['confirmed', 'paid', 'attended']),
  ])

  const profileMap = new Map((profiles || []).map(profile => [profile.id, profile]))
  const ticketMap = new Map((tickets || []).map(ticket => [ticket.id, ticket.name]))
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const eventStarted = new Date(event.start_date).getTime() <= Date.now()

  return <DashboardPage>
    <DashboardPageHeader
      title={`Participantes · ${event.title}`}
      description={eventStarted ? 'Gere inscrições e regista presenças do evento.' : 'Consulta as inscrições. A presença só pode ser registada depois do início do evento.'}
      action={<div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href={`/dashboard/eventos/${id}/editar`}><ArrowLeft className="mr-2 h-4 w-4" />Editar evento</Link></Button><Button asChild variant="outline"><Link href={`/eventos/${id}`}>Ver evento</Link></Button></div>}
    />

    <DashboardStatGrid>
      <DashboardStat label="Inscrições ativas" value={activeCount || 0} icon={<Users className="h-5 w-5" />} />
      <DashboardStat label="Presenças" value={attendedCount || 0} icon={<Calendar className="h-5 w-5" />} />
      <DashboardStat label="Capacidade" value={event.capacity || 'Sem limite'} icon={<Users className="h-5 w-5" />} />
    </DashboardStatGrid>

    <DashboardSection title="Lista de participantes" description="Pesquisa por nome, filtra por estado e gere presenças sem alterar diretamente estados financeiros.">
      <form method="get" className="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px_auto]">
        <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="Pesquisar participante" className="min-h-11 pl-10" /></label>
        <select name="status" defaultValue={status} className="min-h-11 rounded-lg border border-input bg-background px-3"><option value="all">Todos os estados</option>{participantStatuses.map(value => <option key={value} value={value}>{statusLabels[value]}</option>)}</select>
        <Button type="submit">Filtrar</Button>
      </form>

      {rows.length === 0 ? <Card><CardHeader><CardTitle className="text-base">Sem participantes</CardTitle><CardDescription>Não existem inscrições para estes filtros.</CardDescription></CardHeader></Card> : <div className="grid gap-3">{rows.map(row => {
        const profile = profileMap.get(row.user_id)
        const name = profile?.full_name || 'Utilizador'
        const ticketName = row.ticket_type_id ? ticketMap.get(row.ticket_type_id) : null
        const attended = row.status === 'attended'
        const canManageAttendance = eventStarted && !['pending', 'cancelled'].includes(row.status) && !['pending', 'refund_pending', 'refunded'].includes(row.payment_status)
        return <Card key={row.id}><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary">{profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}</div>
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{name}</p><Badge variant="outline">{statusLabels[row.status] || row.status}</Badge><Badge variant="secondary">{paymentLabels[row.payment_status] || row.payment_status}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{ticketName || 'Inscrição geral'}{row.amount != null && Number(row.amount) > 0 ? ` · ${Number(row.amount).toFixed(2)} €` : ''}</p></div>
          </div>
          <div className="shrink-0">{canManageAttendance ? <EventParticipantAttendanceButton eventId={id} participantId={row.id} attended={attended} /> : <span className="text-xs text-muted-foreground">{!eventStarted ? 'Disponível após o início' : 'Sem ação disponível'}</span>}</div>
        </CardContent></Card>
      })}</div>}

      {total > 0 && <div className="mt-5 flex items-center justify-between border-t pt-4"><span className="text-sm text-muted-foreground">{from + 1}–{Math.min(from + PAGE_SIZE, total)} de {total}</span><div className="flex items-center gap-2"><Button asChild variant="outline" size="sm" className={safePage <= 1 ? 'pointer-events-none opacity-50' : ''}><Link href={href(id, safePage - 1, q, status)}>Anterior</Link></Button><span className="text-sm">{safePage}/{totalPages}</span><Button asChild variant="outline" size="sm" className={safePage >= totalPages ? 'pointer-events-none opacity-50' : ''}><Link href={href(id, safePage + 1, q, status)}>Seguinte</Link></Button></div></div>}
    </DashboardSection>
  </DashboardPage>
}
