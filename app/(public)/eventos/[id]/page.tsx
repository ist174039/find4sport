import Link from 'next/link'
import { Calendar, Clock, MapPin, Ticket, UserRound, Users } from 'lucide-react'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { createAdminClient } from '@/lib/supabase/admin'
import { JoinEventBtn } from '@/components/join-event-btn'
import { DetailSection, DetailStat, EntityDetailLayout, EntityHero, MobileActionBar } from '@/components/patterns/entity-detail'
import { EntityGallery } from '@/components/patterns/entity-gallery'
import { Badge } from '@/components/ui/badge'
import { AppImage } from '@/components/ui/app-image'
import { ObterDirecoesBtn } from '@/components/space-actions'

type Professional = { id: string; user_id: string | null; full_name: string | null; professional_name: string | null; avatar_url: string | null; public_slug: string | null }
type Event = { id: string; slug: string | null; title: string; description: string | null; status: string | null; start_date: string | null; end_date: string | null; organizer_name: string | null; address: string | null; latitude: number | null; longitude: number | null; image_url: string | null; gallery_urls: unknown; capacity: number | null; professionals: Professional | null }
type TicketType = { id: string; name: string; description: string | null; price: number | string | null; capacity: number | null; is_active: boolean | null; sort_order: number | null }

function ticketSummary(tickets: TicketType[]) { if (!tickets.length) return 'Grátis'; const prices = tickets.map(ticket => Number(ticket.price)).filter(Number.isFinite); if (!prices.length || Math.max(...prices) === 0) return 'Grátis'; const min = Math.min(...prices); const max = Math.max(...prices); return min === max ? `${min.toFixed(2)} €` : `Desde ${min.toFixed(2)} €` }

export default async function EventProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = createAdminClient()
  const { id: rawId } = await params
  const isUuid = /^[0-9a-f-]{36}$/i.test(rawId)
  const select = '*, professionals(id,user_id,full_name,professional_name,avatar_url,public_slug)'
  let event: Event | null = null
  if (isUuid) event = (await admin.from('events').select(select).eq('id', rawId).maybeSingle()).data as Event | null
  if (!event) event = (await admin.from('events').select(select).eq('slug', rawId).maybeSingle()).data as Event | null
  if (!event || !['published', 'completed'].includes(String(event.status))) notFound()

  const [{ data: tickets }, { count: participantCount }] = await Promise.all([
    admin.from('event_ticket_types').select('id,name,description,price,capacity,is_active,sort_order').eq('event_id', event.id).eq('is_active', true).order('sort_order'),
    admin.from('event_participants').select('id', { count: 'exact', head: true }).eq('event_id', event.id).in('status', ['confirmed', 'paid']),
  ])
  const activeTickets = (tickets || []) as TicketType[]
  const startDate = event.start_date ? new Date(event.start_date) : null
  const endDate = event.end_date ? new Date(event.end_date) : null
  const finished = event.status === 'completed'
  const professional = event.professionals
  const organizerName = event.organizer_name || professional?.professional_name || professional?.full_name || null
  const profileHref = professional ? `/profissionais/${professional.public_slug || professional.id}` : null
  const gallery = [...new Set([event.image_url, ...(Array.isArray(event.gallery_urls) ? event.gallery_urls : [])].filter((value): value is string => typeof value === 'string' && value.length > 0))]
  const priceLabel = ticketSummary(activeTickets)
  const remaining = event.capacity ? Math.max(0, Number(event.capacity) - (participantCount || 0)) : null
  const ticketTypes = activeTickets.map(ticket => ({ ...ticket, price: Number(ticket.price) }))
  const actions = finished ? <div className="inline-flex min-h-11 items-center rounded-xl border bg-muted px-4 text-sm font-semibold text-muted-foreground">Evento terminado</div> : <JoinEventBtn eventId={event.id} eventPrice={Number(activeTickets[0]?.price || 0)} ticketTypes={ticketTypes} />

  return <main className="min-h-screen bg-background pb-36 sm:pb-0"><EntityHero coverUrl={event.image_url} coverAlt={event.title || 'Evento'} avatar={<div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border-2 border-white bg-background shadow-lg sm:h-24 sm:w-24">{startDate ? <><span className="text-2xl font-bold text-primary">{format(startDate, 'dd')}</span><span className="text-xs font-bold uppercase text-muted-foreground">{format(startDate, 'MMM', { locale: pt })}</span></> : <Calendar className="h-8 w-8 text-primary" />}</div>} title={event.title || 'Evento'} badges={<><Badge className="bg-white/15 text-white">Evento</Badge>{finished && <Badge variant="secondary">Terminado</Badge>}</>} meta={<>{startDate && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{format(startDate, "d 'de' MMMM 'de' yyyy", { locale: pt })}</span>}{startDate && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{format(startDate, 'HH:mm')}{endDate ? ` – ${format(endDate, 'HH:mm')}` : ''}</span>}{event.address && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{event.address}</span>}<span className="font-semibold">{priceLabel}</span></>} actions={actions} />
    <EntityDetailLayout main={<><DetailSection title="Sobre o evento">{event.description ? <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">{event.description}</p> : <p className="text-sm text-muted-foreground">O organizador ainda não adicionou uma descrição.</p>}</DetailSection><DetailSection title="Informação do evento" icon={<Calendar className="h-5 w-5 text-primary" />}><div className="grid gap-4 sm:grid-cols-2"><DetailStat label="Preço" value={priceLabel} /><DetailStat label="Participantes" value={event.capacity ? `${participantCount || 0} / ${event.capacity}` : `${participantCount || 0} confirmados`} /><DetailStat label="Lugares disponíveis" value={remaining == null ? 'Sem limite indicado' : remaining} /><DetailStat label="Data" value={startDate ? format(startDate, "d 'de' MMMM 'de' yyyy", { locale: pt }) : 'Não indicada'} /><DetailStat label="Horário" value={startDate ? `${format(startDate, 'HH:mm')}${endDate ? ` – ${format(endDate, 'HH:mm')}` : ''}` : 'Não indicado'} /></div></DetailSection>{activeTickets.length > 0 && <DetailSection title="Bilhetes" icon={<Ticket className="h-5 w-5 text-primary" />}><div className="grid gap-3 sm:grid-cols-2">{activeTickets.map(ticket => <div key={ticket.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{ticket.name}</p>{ticket.description && <p className="mt-1 text-xs text-muted-foreground">{ticket.description}</p>}</div><p className="shrink-0 font-bold">{Number(ticket.price) === 0 ? 'Grátis' : `${Number(ticket.price).toFixed(2)} €`}</p></div>{ticket.capacity && <p className="mt-2 text-xs text-muted-foreground">Lotação deste bilhete: {ticket.capacity}</p>}</div>)}</div></DetailSection>}{gallery.length > 1 && <DetailSection title="Galeria"><EntityGallery images={gallery} alt={event.title || 'Evento'} /></DetailSection>}</>} aside={<><DetailSection title={finished ? 'Estado' : 'Inscrição'} icon={<Ticket className="h-5 w-5 text-primary" />}><p className="mb-4 text-2xl font-bold">{priceLabel}</p>{actions}</DetailSection>{event.address && <DetailSection title="Localização" icon={<MapPin className="h-5 w-5 text-primary" />}><p className="mb-3 text-sm leading-relaxed text-muted-foreground">{event.address}</p><ObterDirecoesBtn address={event.address} name={event.title} latitude={event.latitude} longitude={event.longitude} /></DetailSection>}{organizerName && <DetailSection title="Organização" icon={<UserRound className="h-5 w-5 text-primary" />}>{profileHref ? <Link href={profileHref} className="flex min-h-14 items-center gap-3 rounded-xl border p-3"><div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">{professional?.avatar_url ? <AppImage src={professional.avatar_url} alt={organizerName} fill sizes="44px" className="object-cover" /> : organizerName.charAt(0)}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{organizerName}</p><p className="text-xs text-primary">Ver perfil</p></div></Link> : <div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary" /><p className="text-sm font-semibold">{organizerName}</p></div>}</DetailSection>}</>} /><MobileActionBar>{actions}</MobileActionBar></main>
}
