import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Activity, Calendar, Edit, ExternalLink, MapPin, Plus, Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'
import { EventParticipationCancelDialog } from '@/components/dashboard/event-participation-cancel-dialog'

const PAGE_SIZE = 20
const eventStatuses = ['draft', 'pending', 'published', 'cancelled', 'completed'] as const
const participationStatuses = ['pending', 'confirmed', 'paid', 'cancelled', 'attended'] as const
type EventStatus = (typeof eventStatuses)[number]
type ParticipationStatus = (typeof participationStatuses)[number]

const eventStatusLabel: Record<EventStatus, string> = {
  draft: 'Rascunho',
  pending: 'Pendente de aprovação',
  published: 'Publicado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
}

const participationStatusLabel: Record<ParticipationStatus, string> = {
  pending: 'Pagamento pendente',
  confirmed: 'Inscrição confirmada',
  paid: 'Inscrição paga',
  cancelled: 'Inscrição cancelada',
  attended: 'Participou',
}

function eventStatus(value: string): EventStatus | null {
  return eventStatuses.includes(value as EventStatus) ? value as EventStatus : null
}

function participationStatus(value: string): ParticipationStatus | null {
  return participationStatuses.includes(value as ParticipationStatus) ? value as ParticipationStatus : null
}

function href(page: number, q: string, status: string) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (q) params.set('q', q)
  if (status !== 'all') params.set('status', status)
  return `/dashboard/eventos${params.toString() ? `?${params}` : ''}`
}

export default async function DashboardEventosPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/eventos')

  const access = await resolveSessionAccess(supabase, user)
  if (!access) redirect('/dashboard')

  const params = await searchParams
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1)
  const q = String(Array.isArray(params.q) ? params.q[0] : params.q || '').trim().replace(/[,%]/g, '').slice(0, 100)
  const status = String(Array.isArray(params.status) ? params.status[0] : params.status || 'all')
  const isCreator = ['professional', 'venue_manager'].includes(access.role)
  const from = (page - 1) * PAGE_SIZE

  let rows: Array<Record<string, unknown>> = []
  let total = 0

  if (isCreator) {
    let query = supabase
      .from('events')
      .select('id,title,description,start_date,end_date,address,capacity,status,category_id,image_url,created_at,slug', { count: 'exact' })
      .eq('created_by', user.id)
      .order('start_date', { ascending: false })

    if (q) query = query.or(`title.ilike.%${q}%,address.ilike.%${q}%`)
    const statusFilter = eventStatus(status)
    if (statusFilter) query = query.eq('status', statusFilter)

    const result = await query.range(from, from + PAGE_SIZE - 1)
    if (result.error) throw new Error(`Não foi possível carregar eventos: ${result.error.message}`)
    rows = (result.data || []) as Array<Record<string, unknown>>
    total = result.count || 0
  } else {
    let matchingEventIds: string[] | null = null

    if (q) {
      const eventSearch = await supabase
        .from('events')
        .select('id')
        .or(`title.ilike.%${q}%,address.ilike.%${q}%`)
        .limit(1000)
      if (eventSearch.error) throw new Error(`Não foi possível pesquisar eventos: ${eventSearch.error.message}`)
      matchingEventIds = (eventSearch.data || []).map(event => event.id)
    }

    if (!matchingEventIds || matchingEventIds.length > 0) {
      let query = supabase
        .from('event_participants')
        .select('id,event_id,status,payment_status,created_at,event:events(id,title,start_date,address,image_url,status,slug)', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const statusFilter = participationStatus(status)
      if (statusFilter) query = query.eq('status', statusFilter)
      if (matchingEventIds) query = query.in('event_id', matchingEventIds)

      const result = await query.range(from, from + PAGE_SIZE - 1)
      if (result.error) throw new Error(`Não foi possível carregar inscrições: ${result.error.message}`)
      rows = (result.data || []) as unknown as Array<Record<string, unknown>>
      total = result.count || 0
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  return <DashboardPage>
    <DashboardPageHeader
      title={isCreator ? 'Gestão de Eventos' : 'Os meus eventos'}
      description={isCreator ? 'Eventos criados pela tua conta, independentemente do número de espaços que geres.' : 'Eventos em que tens uma inscrição registada.'}
      action={isCreator ? <div className="flex flex-col gap-2 sm:flex-row"><Button asChild variant="outline"><Link href="/dashboard/agenda">Agenda</Link></Button><Button asChild><Link href="/dashboard/eventos/criar"><Plus className="mr-2 h-4 w-4" />Criar evento</Link></Button></div> : undefined}
    />

    <DashboardSection title={isCreator ? 'Eventos criados' : 'Inscrições'} description="Pesquisa e paginação são aplicadas diretamente sobre os resultados persistidos.">
      <form method="get" className="mb-4 grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_220px_auto]">
        <label className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Título ou localização" className="min-h-11 w-full pl-10" />
        </label>
        <select name="status" defaultValue={status} className="min-h-11 rounded-lg border border-input bg-background px-3">
          <option value="all">Todos os estados</option>
          {(isCreator ? eventStatuses : participationStatuses).map(value => <option key={value} value={value}>{isCreator ? eventStatusLabel[value as EventStatus] : participationStatusLabel[value as ParticipationStatus]}</option>)}
        </select>
        <Button type="submit">Filtrar</Button>
      </form>

      {rows.length === 0 ? <DashboardEmptyState
        icon={isCreator ? <Calendar className="h-10 w-10" /> : <Activity className="h-10 w-10" />}
        title={isCreator ? 'Sem eventos' : 'Sem inscrições'}
        description="Não existem resultados para estes filtros."
        action={isCreator ? <Button asChild><Link href="/dashboard/eventos/criar">Criar evento</Link></Button> : <Button asChild><Link href="/eventos">Explorar eventos</Link></Button>}
      /> : <div className="grid min-w-0 gap-3">{rows.map(row => {
        const relatedEvent = isCreator ? row : row.event as Record<string, unknown> | null | undefined
        const eventId = String(relatedEvent?.id || '')
        const eventSlug = String(relatedEvent?.slug || eventId)
        const eventTitle = String(relatedEvent?.title || 'Evento indisponível')
        const eventImage = typeof relatedEvent?.image_url === 'string' ? relatedEvent.image_url : null
        const eventStart = typeof relatedEvent?.start_date === 'string' ? relatedEvent.start_date : null
        const eventAddress = typeof relatedEvent?.address === 'string' ? relatedEvent.address : null
        const rowStatus = String(row.status || '')
        const paymentStatus = String(row.payment_status || '')
        const statusText = isCreator ? eventStatusLabel[eventStatus(rowStatus) || 'draft'] : participationStatusLabel[participationStatus(rowStatus) || 'pending']
        const capacity = typeof row.capacity === 'number' ? row.capacity : null
        const eventHasStarted = eventStart ? new Date(eventStart).getTime() <= Date.now() : false
        const cancellableParticipation = !isCreator && !eventHasStarted && !['pending', 'cancelled', 'attended'].includes(rowStatus) && ['free', 'paid'].includes(paymentStatus)
        const paidParticipation = paymentStatus === 'paid'

        return <article key={String(row.id)} className="flex min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 gap-3">
            {eventImage && <img src={eventImage} alt="" className="h-20 w-24 shrink-0 rounded-xl object-cover" />}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><h3 className="break-words font-semibold">{eventTitle}</h3><Badge variant="outline">{statusText}</Badge></div>
              <p className="mt-2 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground"><Calendar className="h-4 w-4 shrink-0" />{eventStart ? new Date(eventStart).toLocaleString('pt-PT') : 'Data indisponível'}</p>
              {eventAddress && <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" /><span className="truncate">{eventAddress}</span></p>}
              {isCreator && capacity && <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Users className="h-4 w-4" />{capacity} lugares</p>}
              {!isCreator && paymentStatus === 'pending' && <p className="mt-2 text-xs text-muted-foreground">O checkout ainda está pendente. A vaga fica reservada até o pagamento concluir ou a sessão expirar.</p>}
              {!isCreator && paymentStatus === 'refund_pending' && <p className="mt-2 text-xs text-muted-foreground">O reembolso foi solicitado e está a ser processado.</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {eventId && <Button asChild variant="outline"><Link href={`/eventos/${eventSlug}`}><ExternalLink className="mr-2 h-4 w-4" />Ver</Link></Button>}
            {isCreator && <Button asChild variant="outline"><Link href={`/dashboard/eventos/${String(row.id)}/editar`}><Edit className="mr-2 h-4 w-4" />Editar</Link></Button>}
            {cancellableParticipation && <EventParticipationCancelDialog participantId={String(row.id)} eventTitle={eventTitle} paid={paidParticipation} />}
          </div>
        </article>
      })}</div>}

      {total > 0 && <div className="mt-5 flex items-center justify-between border-t pt-4">
        <span className="text-sm text-muted-foreground">{from + 1}–{Math.min(from + PAGE_SIZE, total)} de {total}</span>
        <div className="flex items-center gap-2"><Button asChild variant="outline" size="sm" className={safePage <= 1 ? 'pointer-events-none opacity-50' : ''}><Link href={href(safePage - 1, q, status)}>Anterior</Link></Button><span className="text-sm">{safePage}/{totalPages}</span><Button asChild variant="outline" size="sm" className={safePage >= totalPages ? 'pointer-events-none opacity-50' : ''}><Link href={href(safePage + 1, q, status)}>Seguinte</Link></Button></div>
      </div>}
    </DashboardSection>
  </DashboardPage>
}
