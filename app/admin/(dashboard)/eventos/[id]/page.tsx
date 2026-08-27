import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Eye, Star, TicketCheck, Users } from 'lucide-react'
import { requireAdminPermission } from '@/lib/auth/authorization'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardEmptyState, DashboardErrorState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

export default async function AdminEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { admin } = await requireAdminPermission('events.manage')
  const [eventResult, participantsResult, reviewsResult, ticketsResult] = await Promise.all([
    admin.from('events').select('*,categories!events_category_id_fkey(name,icon_key),professionals!events_professional_id_fkey(full_name,professional_name),sport_spaces!events_space_id_fkey(name)').eq('id', id).maybeSingle(),
    admin.from('event_participants').select('id,status,payment_status,amount,user_id,ticket_type_id,created_at').eq('event_id', id).order('created_at', { ascending: false }).limit(50),
    admin.from('reviews').select('id,rating,title,comment,status,created_at').eq('event_id', id).order('created_at', { ascending: false }).limit(20),
    admin.from('event_ticket_types').select('id,name,price,capacity,is_active').eq('event_id', id).order('price'),
  ])
  if (eventResult.error) return <DashboardPage><DashboardPageHeader title="Detalhe do evento" description="Informação administrativa do evento." /><DashboardErrorState title="Não foi possível carregar o evento" description={eventResult.error.message} /></DashboardPage>
  if (!eventResult.data) notFound()
  const event = { ...eventResult.data, categories: Array.isArray(eventResult.data.categories) ? eventResult.data.categories[0] : eventResult.data.categories, professionals: Array.isArray(eventResult.data.professionals) ? eventResult.data.professionals[0] : eventResult.data.professionals, sport_spaces: Array.isArray(eventResult.data.sport_spaces) ? eventResult.data.sport_spaces[0] : eventResult.data.sport_spaces }, participants = participantsResult.data || [], reviews = reviewsResult.data || [], tickets = ticketsResult.data || []
  const soldByTicket = new Map<string, number>()
  for (const participant of participants) if (participant.ticket_type_id) soldByTicket.set(participant.ticket_type_id, (soldByTicket.get(participant.ticket_type_id) || 0) + 1)
  return <DashboardPage>
    <DashboardPageHeader title={event.title} description="Publicação, organizador, bilhetes, participantes e reputação do evento." action={<div className="flex gap-2"><Button asChild variant="outline"><Link href="/admin/eventos"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Link></Button><Button asChild><Link href={`/eventos/${event.slug || event.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Página pública</Link></Button></div>} />
    <DashboardStatGrid><DashboardStat label="Participantes" value={participants.length} icon={<Users className="h-5 w-5" />} /><DashboardStat label="Bilhetes" value={tickets.length} icon={<TicketCheck className="h-5 w-5" />} /><DashboardStat label="Avaliações" value={reviews.length} icon={<Star className="h-5 w-5" />} /><DashboardStat label="Visualizações" value={event.views_count || 0} icon={<Calendar className="h-5 w-5" />} /></DashboardStatGrid>
    <DashboardSection title="Informação e publicação"><div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3"><p><span className="font-semibold">Estado:</span> {event.status || '—'}</p><p><span className="font-semibold">Verificado:</span> {event.is_verified ? 'Sim' : 'Não'}</p><p><span className="font-semibold">Categoria:</span> {event.categories?.name || '—'}</p><p><span className="font-semibold">Início:</span> {new Date(event.start_date).toLocaleString('pt-PT')}</p><p><span className="font-semibold">Fim:</span> {event.end_date ? new Date(event.end_date).toLocaleString('pt-PT') : '—'}</p><p><span className="font-semibold">Capacidade:</span> {event.capacity || '—'}</p><p><span className="font-semibold">Organizador:</span> {event.organizer_name || event.professionals?.professional_name || event.professionals?.full_name || event.sport_spaces?.name || '—'}</p><p className="sm:col-span-2"><span className="font-semibold">Local:</span> {event.address || event.sport_spaces?.name || '—'}</p></div>{event.description && <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{event.description}</p>}</DashboardSection>
    <DashboardSection title="Tipos de bilhete">{tickets.length === 0 ? <DashboardEmptyState title="Sem bilhetes" description="Este evento não tem tipos de bilhete configurados." /> : <div className="grid gap-3 md:grid-cols-2">{tickets.map(ticket => <article key={ticket.id} className="rounded-xl border p-3"><div className="flex justify-between gap-2"><p className="font-semibold">{ticket.name}</p><Badge variant={ticket.is_active ? 'default' : 'outline'}>{ticket.is_active ? 'Ativo' : 'Inativo'}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{Number(ticket.price || 0).toFixed(2)} € · {soldByTicket.get(ticket.id) || 0}/{ticket.capacity || '∞'} vendidos</p></article>)}</div>}</DashboardSection>
  </DashboardPage>
}
