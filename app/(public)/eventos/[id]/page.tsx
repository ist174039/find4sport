import Link from 'next/link'
import { Calendar, Clock, MapPin, Ticket, UserRound, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { JoinEventBtn } from '@/components/join-event-btn'
import { DetailSection, DetailStat, EntityDetailLayout, EntityHero, MobileActionBar } from '@/components/patterns/entity-detail'
import { Badge } from '@/components/ui/badge'

function formatPrice(min?: number | null, max?: number | null) {
  if (!min && !max) return 'Grátis'
  if (min != null && max != null && max > min) return `${Number(min).toFixed(2)} € – ${Number(max).toFixed(2)} €`
  return `${Number(min ?? max ?? 0).toFixed(2)} €`
}

export default async function EventProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id: rawId } = await params
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)

  const select = '*, professionals(id, user_id, full_name, professional_name, avatar_url, public_slug)'
  let event: any = null
  if (isUuid) event = (await supabase.from('events').select(select).eq('id', rawId).maybeSingle()).data
  if (!event) event = (await supabase.from('events').select(select).eq('slug', rawId).maybeSingle()).data
  if (!event) notFound()

  const startDate = event.start_date ? new Date(event.start_date) : null
  const endDate = event.end_date ? new Date(event.end_date) : null
  const professional = event.professionals || null
  const organizerName = event.organizer_name || professional?.professional_name || professional?.full_name || null
  const profileHref = professional ? `/profissionais/${professional.public_slug || professional.id}` : null

  const heroMeta = <>
    {startDate && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{format(startDate, "d 'de' MMMM 'de' yyyy", { locale: pt })}</span>}
    {startDate && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{format(startDate, 'HH:mm')}{endDate ? ` – ${format(endDate, 'HH:mm')}` : ''}</span>}
    {event.address && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{event.address}</span>}
  </>

  const actions = <JoinEventBtn eventId={event.id} eventPrice={event.price_min || 0} />

  return (
    <main className="min-h-screen bg-background pb-20 sm:pb-0">
      <EntityHero
        coverUrl={event.image_url}
        coverAlt={event.title || 'Evento'}
        avatar={<div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl border-2 border-white bg-background shadow-lg sm:h-24 sm:w-24">{startDate ? <><span className="text-2xl font-bold text-primary">{format(startDate, 'dd')}</span><span className="text-xs font-bold uppercase text-muted-foreground">{format(startDate, 'MMM', { locale: pt })}</span></> : <Calendar className="h-8 w-8 text-primary" />}</div>}
        title={event.title || 'Evento'}
        badges={<Badge className="bg-white/15 text-white hover:bg-white/20">Evento</Badge>}
        meta={heroMeta}
        actions={actions}
      />

      <EntityDetailLayout
        main={<>
          <DetailSection title="Sobre o evento">
            {event.description ? <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">{event.description}</p> : <p className="text-sm text-muted-foreground">O organizador ainda não adicionou uma descrição.</p>}
          </DetailSection>

          <DetailSection title="Informação do evento" icon={<Calendar className="h-5 w-5 text-primary" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailStat label="Preço" value={formatPrice(event.price_min, event.price_max)} />
              <DetailStat label="Capacidade" value={event.capacity ? `${event.capacity} participantes` : 'Não indicada'} />
              <DetailStat label="Data" value={startDate ? format(startDate, "d 'de' MMMM 'de' yyyy", { locale: pt }) : 'Não indicada'} />
              <DetailStat label="Horário" value={startDate ? `${format(startDate, 'HH:mm')}${endDate ? ` – ${format(endDate, 'HH:mm')}` : ''}` : 'Não indicado'} />
            </div>
          </DetailSection>
        </>}
        aside={<>
          <DetailSection title="Inscrição" icon={<Ticket className="h-5 w-5 text-primary" />}>
            <p className="mb-4 text-2xl font-bold">{formatPrice(event.price_min, event.price_max)}</p>
            <JoinEventBtn eventId={event.id} eventPrice={event.price_min || 0} />
          </DetailSection>

          {event.address && <DetailSection title="Localização" icon={<MapPin className="h-5 w-5 text-primary" />}><p className="text-sm leading-relaxed text-muted-foreground">{event.address}</p></DetailSection>}

          {organizerName && <DetailSection title="Organização" icon={<UserRound className="h-5 w-5 text-primary" />}>
            {profileHref ? <Link href={profileHref} className="flex min-h-14 items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">{professional?.avatar_url ? <img src={professional.avatar_url} alt={organizerName} className="h-full w-full object-cover" /> : organizerName.charAt(0)}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{organizerName}</p><p className="text-xs text-primary">Ver perfil</p></div></Link> : <div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary" /><p className="text-sm font-semibold">{organizerName}</p></div>}
          </DetailSection>}
        </>}
      />

      <MobileActionBar><JoinEventBtn eventId={event.id} eventPrice={event.price_min || 0} /></MobileActionBar>
    </main>
  )
}
