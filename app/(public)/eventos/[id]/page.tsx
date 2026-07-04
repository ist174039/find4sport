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
        <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <span>Eventos</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary truncate max-w-[200px]">{event.slug || 'Detalhes'}</span>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">share</span>
          </button>
          <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-error hover:bg-error/10 transition-colors">
            <span className="material-symbols-outlined">favorite_border</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Image & Main Info) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl overflow-hidden bg-surface-container-highest aspect-[16/9] shadow-md border border-border-subtle relative">
            <img src={imageUrl} alt="Evento" className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-center shadow-lg border border-white/50">
              <span className="block text-error font-bold text-xl leading-none">{format(startDate, 'dd')}</span>
              <span className="block text-text-primary text-[10px] font-bold uppercase">{format(startDate, 'MMM', { locale: ptBR })}</span>
            </div>
          </div>

          <section className="bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle shadow-sm">
            <div className="mb-6">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider mb-4 inline-block">
                Evento Desportivo
              </span>
              <h1 className="font-display-md text-3xl md:text-4xl font-bold text-text-primary leading-tight">
                {event.slug ? event.slug.replace(/-/g, ' ').toUpperCase() : 'Evento Exclusivo FIND4SPORT'}
              </h1>
            </div>
            
            <h2 className="font-headline-md text-xl mb-4 text-text-primary">Sobre o Evento</h2>
            <p className="text-body-lg text-on-surface leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </section>
        </div>

        {/* Right Column (Tickets & Sidebar) */}
        <div className="space-y-6">
          {/* Ticket/Checkout Box */}
          <section className="bg-surface-container-lowest p-6 rounded-3xl border border-border-subtle shadow-lg sticky top-24">
            <div className="mb-6">
              <p className="text-on-surface-variant text-label-sm uppercase font-bold mb-1">Preço Bilhete</p>
              <div className="flex items-end gap-2">
                <span className="font-display-md text-4xl font-bold text-text-primary">
                  {event.price_min ? `€${event.price_min}` : 'Grátis'}
                </span>
                {event.price_max && event.price_max > event.price_min && (
                  <span className="text-on-surface-variant text-body-lg mb-1"> - €{event.price_max}</span>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                </div>
                <div>
                  <p className="font-bold text-text-primary">{formattedDate}</p>
                  <p className="text-body-md text-on-surface-variant">{formattedTime} • Duração estimada: 2h</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">location_on</span>
                </div>
                <div>
                  <p className="font-bold text-text-primary">{event.address || 'Localização a anunciar'}</p>
                  <p className="text-body-md text-primary hover:underline cursor-pointer">Ver no mapa</p>
                </div>
              </div>
            </div>

            <button className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-label-lg shadow-md hover:shadow-lg hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">local_activity</span>
              Comprar Bilhete
            </button>
            <p className="text-center text-[11px] text-on-surface-variant mt-3 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Pagamento 100% Seguro
            </p>
          </section>

          {/* Organizer */}
          <section className="bg-surface-container-lowest p-6 rounded-3xl border border-border-subtle shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-surface-container overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" alt="Organizador" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[11px] text-on-surface-variant uppercase font-bold">Organizado por</p>
              <p className="font-bold text-text-primary">{organizer}</p>
              <button className="text-primary text-[12px] font-bold hover:underline">Ver Perfil</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
