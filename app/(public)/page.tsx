import { Activity, ArrowRight, BadgeCheck, Building, Heart, MapPin, MessageSquare, ShoppingBag, Star, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { HeroCarousel } from '@/components/hero-carousel'

export default async function Page() {
  const supabase = await createClient()

  const [spacesCount, profsCount, eventsCount, popularSpaces, topProfessionals, carouselRes] = await Promise.all([
    supabase.from('sport_spaces').select('id', { count: 'exact', head: true }),
    supabase.from('professionals').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('sport_spaces').select('*').order('review_count', { ascending: false }).limit(6),
    supabase.from('professionals').select('*').order('rating_avg', { ascending: false }).limit(6),
    supabase.from('carousel_slides').select('*').eq('is_active', true).order('display_order', { ascending: true })
  ])
  
  const spaces = popularSpaces.data || []
  const profs = topProfessionals.data || []
  const slides = carouselRes.data || []

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Carousel Section */}
      <HeroCarousel 
        slides={slides} 
        spacesCount={spacesCount.count || 0}
        profsCount={profsCount.count || 0}
        eventsCount={eventsCount.count || 0}
      />

      {/* Ecosystem Section */}
      <section className="py-16 sm:py-24 border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Tudo num só lugar</h2>
          <p className="mt-4 text-muted-foreground text-lg mb-16">O ecossistema desportivo mais completo de Portugal</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <Link href="/pesquisa?type=espacos" className="relative flex flex-col items-center p-6 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group border border-border/50">
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop" alt="Espaços" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors"></div>
              <div className="relative z-10 flex flex-col items-center w-full h-full">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Building className="text-[28px]" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1 text-center">Espaços</h3>
                <p className="text-xs text-gray-200 text-center">Reserva online</p>
              </div>
            </Link>
            <Link href="/pesquisa?type=profissionais" className="relative flex flex-col items-center p-6 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group border border-border/50">
              <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop" alt="Profissionais" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors"></div>
              <div className="relative z-10 flex flex-col items-center w-full h-full">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <UserCheck className="text-[28px]" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1 text-center">Profissionais</h3>
                <p className="text-xs text-gray-200 text-center">PT, fisio, nutrição</p>
              </div>
            </Link>
            <Link href="/pesquisa?q=Saúde" className="relative flex flex-col items-center p-6 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group border border-border/50">
              <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop" alt="Saúde" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors"></div>
              <div className="relative z-10 flex flex-col items-center w-full h-full">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Heart className="text-[28px]" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1 text-center">Saúde</h3>
                <p className="text-xs text-gray-200 text-center">Recovery & bem-estar</p>
              </div>
            </Link>
            <Link href="/pesquisa?type=eventos" className="relative flex flex-col items-center p-6 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group border border-border/50">
              <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600&auto=format&fit=crop" alt="Eventos" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors"></div>
              <div className="relative z-10 flex flex-col items-center w-full h-full">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Activity className="text-[28px]" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1 text-center">Eventos</h3>
                <p className="text-xs text-gray-200 text-center">Provas & torneios</p>
              </div>
            </Link>
            <Link href="/feed" className="relative flex flex-col items-center p-6 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group border border-border/50">
              <img src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600&auto=format&fit=crop" alt="Feed" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors"></div>
              <div className="relative z-10 flex flex-col items-center w-full h-full">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <ShoppingBag className="text-[28px]" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1 text-center">Feed</h3>
                <p className="text-xs text-gray-200 text-center">Publicações & notícias</p>
              </div>
            </Link>
            <Link href="/comunidades" className="relative flex flex-col items-center p-6 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer group border border-border/50">
              <img src="https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=600&auto=format&fit=crop" alt="Comunidades" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors"></div>
              <div className="relative z-10 flex flex-col items-center w-full h-full">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <MessageSquare className="text-[28px]" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1 text-center">Comunidades</h3>
                <p className="text-xs text-gray-200 text-center">Inspire-se & Junte-se</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Professionals */}
      <section className="py-16 sm:py-24 bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Top Profissionais, Lisboa, Portugal</h2>
              <p className="mt-2 text-muted-foreground">Os profissionais mais reconhecidos da nossa rede</p>
            </div>
            <Link href="/pesquisa" className="hidden sm:flex text-primary font-medium text-sm items-center gap-1 hover:underline">
              Ver todos <ArrowRight className="text-sm h-5 w-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {profs.map((prof) => (
              <Link href={`/profissionais/${prof.public_slug || prof.id}`} key={prof.id} className="relative group rounded-xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="relative aspect-square w-full overflow-hidden">
                  <img 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    alt={prof.full_name} 
                    src={prof.avatar_url || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=640&auto=format&fit=crop'} 
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                    <Star className="text-yellow-500 text-[12px] fill-yellow-500" />
                    <span>{prof.rating_avg?.toFixed(1) || 'Novo'}</span>
                  </div>
                </div>
                
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-semibold text-sm line-clamp-1 text-foreground" title={prof.full_name}>{prof.full_name}</h3>
                    {prof.is_verified && <BadgeCheck className="text-emerald-500 h-4 w-4 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-1">{prof.distance || 'Lisboa'}</span>
                  </div>
                  <div className="mt-auto pt-2 font-medium text-sm text-foreground">
                    {prof.price_avg ? `€${prof.price_avg}/h` : 'Preço sob consulta'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/pesquisa" className="text-primary font-medium text-sm hover:underline">
              Ver todos os profissionais
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Spaces */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Espaços Populares, Lisboa, Portugal</h2>
              <p className="mt-2 text-muted-foreground">Os espaços desportivos mais bem avaliados pela comunidade</p>
            </div>
            <Link href="/pesquisa?type=spaces" className="hidden sm:flex text-primary font-medium text-sm items-center gap-1 hover:underline">
              Ver todos <ArrowRight className="text-sm h-5 w-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {spaces.map((space) => (
              <Link href={`/espacos/${space.slug || space.id}`} key={space.id} className="relative group rounded-xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="relative aspect-square w-full overflow-hidden">
                  <img 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    alt={space.name} 
                    src={space.gallery_urls?.[0] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'} 
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                    <Star className="text-yellow-500 text-[12px] fill-yellow-500" />
                    <span>{space.rating_avg?.toFixed(1) || 'Novo'}</span>
                  </div>
                </div>
                
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <h3 className="font-semibold text-sm line-clamp-1 text-foreground" title={space.name}>{space.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="line-clamp-1">{space.distance || 'Lisboa'}</span>
                  </div>
                  <div className="mt-auto pt-2 font-medium text-sm text-foreground">
                    {space.price_avg ? `€${space.price_avg}/h` : 'Preço sob consulta'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/pesquisa?type=spaces" className="text-primary font-medium text-sm hover:underline">
              Ver todos os espaços
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
