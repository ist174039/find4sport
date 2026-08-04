import { Calendar, ChevronRight, Heart, Lock, MapPin, Share2, Ticket } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { JoinEventBtn } from '@/components/join-event-btn'
import { ReviewsSection } from '@/components/reviews-section'

export default async function EventProfilePage(props: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id: rawId } = await props.params

  // Fetch event by UUID or by slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)

  let event = null
  if (isUuid) {
    const { data } = await supabase.from('events').select('*, professionals(avatar_url, public_slug)').eq('id', rawId).maybeSingle()
    event = data
  }
  if (!event) {
    const { data } = await supabase.from('events').select('*, professionals(avatar_url, public_slug)').eq('slug', rawId).maybeSingle()
    event = data
  }

  if (!event) {
    return notFound()
  }

  // Fallback values
  const imageUrl = event.image_url || 'https://images.unsplash.com/photo-1552674605-15c2145eba11?q=80&w=1920&auto=format&fit=crop'
  const description = event.description || 'Junta-te a nós neste evento desportivo incrível. Vagas limitadas, garante já o teu lugar!'
  const organizer = event.organizer_name || 'Organização FIND4SPORT'
  
  // Use real start_date if available
  const startDate = event.start_date ? new Date(event.start_date) : new Date()
  
  const formattedDate = format(startDate, "d 'de' MMMM, yyyy", { locale: ptBR })
  const formattedTime = format(startDate, "HH:mm")
  const eventTitle = event.title || event.slug?.replace(/-/g, ' ') || 'Evento Desportivo'
  
  const professional = event.professionals || null
  const organizerAvatar = professional?.avatar_url || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop'
  const profileLink = professional?.public_slug 
    ? `/profissionais/${professional.public_slug}` 
    : professional?.id 
      ? `/profissionais/${professional.id}` 
      : null

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* Immersive Cover Section */}
      <section className="relative w-full h-[250px] md:h-[350px] bg-muted">
        <img src={imageUrl} alt="Capa do evento" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        {/* Cover Content Bottom Aligned */}
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-6 relative">
            <div className="flex-1 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white flex flex-col items-center justify-center text-foreground shadow-lg shrink-0 overflow-hidden border border-border">
                    <span className="block text-destructive font-bold text-xl leading-none">{format(startDate, 'dd')}</span>
                    <span className="block text-foreground text-[10px] font-bold uppercase">{format(startDate, 'MMM', { locale: ptBR })}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                        {eventTitle}
                      </h1>
                    </div>
                    <div className="flex items-center gap-4 text-white/90 text-sm mt-2">
                      <span className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[11px] border border-white/10">
                        Evento Desportivo
                      </span>
                      {event.address && (
                        <span className="flex items-center gap-1 font-medium drop-shadow">
                          <MapPin className="text-[18px]" />
                          {event.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pb-1 w-full md:w-auto mt-4 md:mt-0">
                <div className="w-full sm:w-auto min-w-[200px]">
                  <JoinEventBtn eventId={event.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Main Info) */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm mb-8">
              <h2 className="text-xl font-bold mb-4 text-foreground">Sobre o Evento</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </section>
          </div>

          {/* Right Column (Tickets & Sidebar) */}
          <div className="space-y-6">
            {/* Ticket/Checkout Box */}
            <section className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <div className="mb-6">
                <p className="text-muted-foreground text-xs uppercase font-bold mb-1">Preço Bilhete</p>
                <div className="flex items-end gap-2">
                  <span className="font-bold text-2xl text-4xl text-foreground">
                    {event.price_min ? `€${event.price_min}` : 'Grátis'}
                  </span>
                  {event.price_max && event.price_max > event.price_min && (
                    <span className="text-muted-foreground text-base mb-1"> - €{event.price_max}</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Calendar className="text-[24px]" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">{formattedTime} • Duração estimada: 2h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="text-[24px]" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{event.address || 'Localização a anunciar'}</p>
                    <p className="text-sm text-primary hover:underline cursor-pointer">Ver no mapa</p>
                  </div>
                </div>
              </div>

              <JoinEventBtn eventId={event.id} />
              
              <p className="text-center text-[11px] text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <Lock className="text-[14px]" />
                Inscrição 100% Segura
              </p>
            </section>

            {/* Organizer */}
            {profileLink ? (
              <Link href={profileLink} className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-primary transition-colors group cursor-pointer block">
                <div className="w-14 h-14 rounded-full bg-muted overflow-hidden shrink-0">
                  <img src={organizerAvatar} alt="Organizador" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold">Organizado por</p>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">{organizer}</p>
                  <span className="text-primary text-[12px] font-bold">
                    Ver Perfil
                  </span>
                </div>
              </Link>
            ) : (
              <section className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-muted overflow-hidden shrink-0">
                  <img src={organizerAvatar} alt="Organizador" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-bold">Organizado por</p>
                  <p className="font-bold text-foreground">{organizer}</p>
                </div>
              </section>
            )}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <ReviewsSection targetType="event" targetId={event.id} />
        </div>
      </section>
    </main>
  )
}
