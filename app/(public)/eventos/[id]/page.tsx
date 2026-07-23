import { Calendar, ChevronRight, Heart, Lock, MapPin, Share2, Ticket } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function EventProfilePage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // 1. Fetch event data
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !event) {
    return notFound()
  }

  // Fallback values
  const imageUrl = event.image_url || 'https://images.unsplash.com/photo-1552674605-15c2145eba11?q=80&w=1920&auto=format&fit=crop'
  const description = event.description || 'Junta-te a nós neste evento desportivo incrível. Vagas limitadas, garante já o teu lugar!'
  const organizer = event.organizer_name || 'Organização FIND4SPORT'
  
  // Fake date if not present for layout purposes
  const startDate = event.created_at ? new Date(event.created_at) : new Date()
  // Add 7 days to start date for a fake event date if real one doesn't exist
  startDate.setDate(startDate.getDate() + 7) 
  
  const formattedDate = format(startDate, "d 'de' MMMM, yyyy", { locale: ptBR })
  const formattedTime = format(startDate, "HH:mm")

  return (
    <main className="pt-24 pb-20 max-w-[1280px] mx-auto px-4 md:px-12 md:pl-64">
      {/* Breadcrumb & Top actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Eventos</span>
          <ChevronRight className="text-[16px]" />
          <span className="text-primary truncate max-w-[200px]">{event.slug || 'Detalhes'}</span>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Image & Main Info) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl overflow-hidden bg-accent aspect-[16/9] shadow-md border border-border relative">
            <img src={imageUrl} alt="Evento" className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-center shadow-lg border border-white/50">
              <span className="block text-destructive font-bold text-xl leading-none">{format(startDate, 'dd')}</span>
              <span className="block text-foreground text-[10px] font-bold uppercase">{format(startDate, 'MMM', { locale: ptBR })}</span>
            </div>
          </div>

          <section className="bg-card p-8 rounded-3xl border border-border shadow-sm">
            <div className="mb-6">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider mb-4 inline-block">
                Evento Desportivo
              </span>
              <h1 className="font-bold text-2xl text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {event.slug ? event.slug.replace(/-/g, ' ').toUpperCase() : 'Evento Exclusivo FIND4SPORT'}
              </h1>
            </div>
            
            <h2 className="font-semibold text-xl text-xl mb-4 text-foreground">Sobre o Evento</h2>
            <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </section>
        </div>

        {/* Right Column (Tickets & Sidebar) */}
        <div className="space-y-6">
          {/* Ticket/Checkout Box */}
          <section className="bg-card p-6 rounded-3xl border border-border shadow-lg sticky top-24">
            <div className="mb-6">
              <p className="text-muted-foreground text-xs uppercase font-bold mb-1">Preço Bilhete</p>
              <div className="flex items-end gap-2">
                <span className="font-bold text-2xl text-4xl font-bold text-foreground">
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

            <button className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base shadow-md hover:shadow-lg hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2">
              <Ticket className="h-5 w-5" />
              Comprar Bilhete
            </button>
            <p className="text-center text-[11px] text-muted-foreground mt-3 flex items-center justify-center gap-1">
              <Lock className="text-[14px]" />
              Pagamento 100% Seguro
            </p>
          </section>

          {/* Organizer */}
          <section className="bg-card p-6 rounded-3xl border border-border shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-muted overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" alt="Organizador" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-bold">Organizado por</p>
              <p className="font-bold text-foreground">{organizer}</p>
              <button className="text-primary text-[12px] font-bold hover:underline">Ver Perfil</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
