import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function SpaceProfilePage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // 1. Fetch space data
  const { data: space, error } = await supabase
    .from('sport_spaces')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !space) {
    return notFound()
  }

  // Fallback values
  const coverUrl = space.cover_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop'
  const logoUrl = space.logo_url || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200&auto=format&fit=crop'
  const description = space.description || 'Este espaço desportivo oferece excelentes condições para a sua prática desportiva. Venha conhecer as nossas instalações!'

  return (
    <main className="pb-20 max-w-[1280px] mx-auto">
      {/* Immersive Cover Section (Full Width Top) */}
      <div className="relative w-full h-[300px] md:h-[400px] mb-8 bg-surface-container-highest">
        <img src={coverUrl} alt="Capa do espaço" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        
        {/* Cover Content Bottom Aligned */}
        <div className="absolute bottom-0 left-0 w-full px-4 md:px-12 md:pl-64 pb-8">
          <div className="flex flex-col md:flex-row items-end gap-6 relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-surface bg-surface shadow-xl overflow-hidden shrink-0 mt-4 md:mt-0 relative z-10 -mb-12 md:-mb-16">
              <img src={logoUrl} alt={space.name} className="w-full h-full object-cover bg-white" />
            </div>
            
            <div className="flex-1 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display-md text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                    {space.name}
                  </h1>
                  {space.is_verified && (
                    <span className="material-symbols-outlined text-trust-gold text-[28px] drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-white/90 text-label-md mt-2">
                  <span className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold border border-white/10">
                    Espaço Desportivo
                  </span>
                  {space.address && (
                    <span className="flex items-center gap-1 drop-shadow">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {space.address}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pb-1 w-full md:w-auto">
                <button className="flex-1 md:flex-none bg-white text-text-primary px-8 py-3 rounded-xl font-label-lg shadow-lg hover:bg-surface-container-lowest transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[24px]">calendar_month</span>
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
          <section className="bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle shadow-sm">
            <h2 className="font-headline-md text-2xl mb-4 text-text-primary">O Espaço</h2>
            <p className="text-body-lg text-on-surface leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </section>

          {/* Infrastructure/Amenities */}
          <section className="bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle shadow-sm">
            <h2 className="font-headline-md text-2xl mb-6 text-text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">domain</span>
              Infraestruturas & Comodidades
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
              <div className="flex items-center gap-3 text-on-surface">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">directions_car</span>
                </div>
                <span className="font-label-md">Estacionamento</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">shower</span>
                </div>
                <span className="font-label-md">Balneários</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">wifi</span>
                </div>
                <span className="font-label-md">Wi-Fi Grátis</span>
              </div>
              <div className="flex items-center gap-3 text-on-surface">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">coffee</span>
                </div>
                <span className="font-label-md">Cafetaria</span>
              </div>
            </div>
          </section>

          {/* Gallery */}
          {space.gallery_urls && space.gallery_urls.length > 0 && (
            <section className="bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle shadow-sm">
              <h2 className="font-headline-md text-2xl mb-6 text-text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_library</span>
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
          <section className="bg-surface-container-lowest rounded-3xl border border-border-subtle shadow-sm overflow-hidden flex flex-col">
            <div className="h-40 bg-surface-container-highest relative">
              {/* Fake Map background for visual */}
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" alt="Map" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[48px] text-error drop-shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-headline-sm text-lg mb-2 text-text-primary">Localização</h3>
              <p className="text-body-md text-on-surface-variant mb-4">{space.address}</p>
              <button className="w-full py-2.5 border border-primary text-primary font-bold rounded-xl text-label-md hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">directions</span>
                Obter Direções
              </button>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-surface-container-lowest p-6 rounded-3xl border border-border-subtle shadow-sm">
            <h3 className="font-headline-sm text-lg mb-4 text-text-primary">Contactos</h3>
            <ul className="space-y-4">
              {space.phone && (
                <li className="flex items-center gap-3 text-body-md text-on-surface">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2.5 rounded-xl">call</span>
                  {space.phone}
                </li>
              )}
              {space.email && (
                <li className="flex items-center gap-3 text-body-md text-on-surface">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2.5 rounded-xl">mail</span>
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
