import { BadgeCheck, Building2, Calendar, Car, Coffee, Images, Mail, MapPin, Navigation, Phone, ShowerHead, Wifi } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ReserveSpaceBtn, ObterDirecoesBtn } from '@/components/space-actions'
import { ReviewsSection } from '@/components/reviews-section'
import { FollowButton } from '@/components/follow-button'

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

  // Fetch Follow stats
  const { count: followersCount } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', space.owner_user_id)

  const { count: followingCount } = await supabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', space.owner_user_id)

  let isFollowing = false
  const { data: { user } } = await supabase.auth.getUser()
  if (user && user.id !== space.owner_user_id) {
    const { data: followRel } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', space.owner_user_id)
      .maybeSingle()
    if (followRel) isFollowing = true
  }

  // Fallback values
  const coverUrl = space.cover_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop'
  const logoUrl = space.logo_url || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200&auto=format&fit=crop'
  const description = space.description || 'Este espaço desportivo oferece excelentes condições para a sua prática desportiva. Venha conhecer as nossas instalações!'

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* Immersive Cover Section (Full Width Top) */}
      <section className="relative w-full h-[250px] md:h-[350px] bg-muted">
        <img src={coverUrl} alt="Capa do espaço" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        {/* Cover Content Bottom Aligned */}
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-6 relative">
            
            <div className="flex-1 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-primary-foreground shadow-lg shrink-0 overflow-hidden">
                    <img src={logoUrl} alt={space.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                        {space.name}
                      </h1>
                      {space.is_verified && (
                        <BadgeCheck className="text-amber-500 text-[28px] drop-shadow-md" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-white/90 text-sm mt-2">
                      <span className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[11px] border border-white/10">
                        Espaço Desportivo
                      </span>
                      {space.address && (
                        <span className="flex items-center gap-1 font-medium drop-shadow">
                          <MapPin className="text-[18px]" />
                          {space.address}
                        </span>
                      )}
                      <div className="h-4 w-px bg-white/30 hidden sm:block"></div>
                      <span className="font-bold drop-shadow">{followersCount || 0} <span className="font-normal text-white/80">Seguidores</span></span>
                      <span className="font-bold drop-shadow">{followingCount || 0} <span className="font-normal text-white/80">A Seguir</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pb-1 w-full md:w-auto mt-4 md:mt-0">
                {user && user.id !== space.owner_user_id && space.owner_user_id && (
                  <FollowButton 
                    targetUserId={space.owner_user_id} 
                    initialIsFollowing={isFollowing} 
                  />
                )}
                <ReserveSpaceBtn 
                  spaceName={space.name} 
                  ownerUserId={space.owner_user_id || space.created_by} 
                />
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
          <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
            <h2 className="font-semibold text-xl text-2xl mb-4 text-foreground">O Espaço</h2>
            <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </section>

          {/* Infrastructure/Amenities */}
          <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
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
            <section className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
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
        <div className="space-y-6">
          {/* Map/Location Section */}
          <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
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
              <ObterDirecoesBtn 
                address={space.address} 
                name={space.name} 
                latitude={space.latitude} 
                longitude={space.longitude} 
              />
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-card p-6 rounded-2xl border border-border shadow-sm">
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
      </section>

      {/* Reviews Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <ReviewsSection targetType="space" targetId={space.id} />
        </div>
      </section>
    </main>
  )
}
