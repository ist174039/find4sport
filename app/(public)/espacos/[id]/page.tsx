import { BadgeCheck, Building2, Calendar, Car, Coffee, Images, Mail, MapPin, Navigation, Phone, ShowerHead, Wifi } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function SpaceProfilePage(props: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id: rawId } = await props.params

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)

  let space = null
  if (isUuid) {
    const { data } = await supabase.from('sport_spaces').select('*').eq('id', rawId).maybeSingle()
    space = data
  }

  if (!space) {
    const { data } = await supabase.from('sport_spaces').select('*').eq('slug', rawId).maybeSingle()
    space = data
  }

  if (!space) {
    return notFound()
  }

  // Fallback values
  const coverUrl = space.cover_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop'
  const logoUrl = space.logo_url || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200&auto=format&fit=crop'
  const description = space.description || 'Este espaço desportivo oferece excelentes condições para a sua prática desportiva. Venha conhecer as nossas instalações!'

  return (
    <main className="pb-20 max-w-[1280px] mx-auto">
      {/* Immersive Cover Section (Full Width Top) */}
      <div className="relative w-full h-[300px] md:h-[400px] mb-8 bg-accent">
        <img src={coverUrl} alt="Capa do espaço" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        {/* Cover Content Bottom Aligned */}
        <div className="absolute bottom-0 left-0 w-full px-4 md:px-12 md:pl-64 pb-8">
          <div className="flex flex-col md:flex-row items-end gap-6 relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-surface bg-background shadow-xl overflow-hidden shrink-0 mt-4 md:mt-0 relative z-10 -mb-12 md:-mb-16">
              <img src={logoUrl} alt={space.name} className="w-full h-full object-cover bg-white" />
            </div>
            
            <div className="flex-1 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-bold text-2xl text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                    {space.name}
                  </h1>
                  {space.is_verified && (
                    <BadgeCheck className="text-amber-500 text-[28px] drop-shadow-md" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-white/90 text-sm mt-2">
                  <span className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold border border-white/10">
                    Espaço Desportivo
                  </span>
                  {space.address && (
                    <span className="flex items-center gap-1 drop-shadow">
                      <MapPin className="text-[16px]" />
                      {space.address}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pb-1 w-full md:w-auto">
                <button className="flex-1 md:flex-none bg-white text-foreground px-8 py-3 rounded-xl font-medium text-base shadow-lg hover:bg-card transition-all flex items-center justify-center gap-2">
                  <Calendar className="text-[24px]" />
                  Reservar Espaço
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-4 md:px-12 md:pl-64 pt-8 md:pt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card p-8 rounded-3xl border border-border shadow-sm">
            <h2 className="font-semibold text-xl text-2xl mb-4 text-foreground">O Espaço</h2>
            <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </section>

          {/* Infrastructure/Amenities */}
          <section className="bg-card p-8 rounded-3xl border border-border shadow-sm">
            <h2 className="font-semibold text-xl text-2xl mb-6 text-foreground flex items-center gap-2">
              <Building2 className="text-primary h-5 w-5" />
              Infraestruturas & Comodidades
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
              <div className="flex items-center gap-3 text-foreground">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary">
                  <Car className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">Estacionamento</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary">
                  <ShowerHead className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">Balneários</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary">
                  <Wifi className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">Wi-Fi Grátis</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary">
                  <Coffee className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">Cafetaria</span>
              </div>
            </div>
          </section>

          {/* Gallery */}
          {space.gallery_urls && space.gallery_urls.length > 0 && (
            <section className="bg-card p-8 rounded-3xl border border-border shadow-sm">
              <h2 className="font-semibold text-xl text-2xl mb-6 text-foreground flex items-center gap-2">
                <Images className="text-primary h-5 w-5" />
                Galeria
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {space.gallery_urls.slice(0, 4).map((img: string, i: number) => (
                  <div key={i} className={`rounded-2xl overflow-hidden shadow-sm ${i === 0 ? 'col-span-2 aspect-[21/9]' : 'aspect-square'}`}>
                    <img src={img} alt={`Instalações ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (Sidebar Info) */}
        <div className="space-y-8">
          {/* Map/Location Section */}
          <section className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="h-40 bg-accent relative">
              {/* Fake Map background for visual */}
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" alt="Map" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="text-[48px] text-destructive drop-shadow-lg" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg text-lg mb-2 text-foreground">Localização</h3>
              <p className="text-sm text-muted-foreground mb-4">{space.address}</p>
              <button className="w-full py-2.5 border border-primary text-primary font-bold rounded-xl text-sm hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                <Navigation className="text-[18px]" />
                Obter Direções
              </button>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-card p-6 rounded-3xl border border-border shadow-sm">
            <h3 className="font-semibold text-lg text-lg mb-4 text-foreground">Contactos</h3>
            <ul className="space-y-4">
              {space.phone && (
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Phone className="text-primary bg-primary/10 p-2.5 rounded-xl h-5 w-5" />
                  {space.phone}
                </li>
              )}
              {space.email && (
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Mail className="text-primary bg-primary/10 p-2.5 rounded-xl h-5 w-5" />
                  {space.email}
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
