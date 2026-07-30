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
            <Link href="/pesquisa?type=espacos" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building className="text-[28px]" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Espaços</h3>
              <p className="text-xs text-muted-foreground">Reserva online</p>
            </Link>
            <Link href="/pesquisa?type=profissionais" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="text-[28px]" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Profissionais</h3>
              <p className="text-xs text-muted-foreground">PT, fisio, nutrição</p>
            </Link>
            <Link href="/pesquisa?q=Saúde" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-md hover:border-pink-500/50 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="text-[28px]" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Saúde</h3>
              <p className="text-xs text-muted-foreground">Recovery & bem-estar</p>
            </Link>
            <Link href="/pesquisa?type=eventos" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-md hover:border-orange-500/50 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="text-[28px]" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Eventos</h3>
              <p className="text-xs text-muted-foreground">Provas & torneios</p>
            </Link>
            <Link href="/feed" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-md hover:border-purple-500/50 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="text-[28px]" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Feed</h3>
              <p className="text-xs text-muted-foreground">Publicações & notícias</p>
            </Link>
            <Link href="/comunidades" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="text-[28px]" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Comunidades</h3>
              <p className="text-xs text-muted-foreground">Inspire-se & Junte-se</p>
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
              <Link href={`/profissionais/${prof.public_slug || prof.id}`} key={prof.id} className="relative group aspect-square rounded-xl overflow-hidden bg-muted block shadow-sm hover:shadow-xl hover:z-10 transition-all duration-300">
                <img 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt={prof.full_name} 
                  src={prof.avatar_url || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=640&auto=format&fit=crop'} 
                />
                
                {/* Always visible base overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-0"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300 group-hover:opacity-0 flex items-center justify-between">
                  <h3 className="text-white font-semibold text-sm truncate flex-1">{prof.full_name}</h3>
                  {prof.is_verified && <BadgeCheck className="text-emerald-400 h-4 w-4 ml-1 flex-shrink-0" />}
                </div>

                {/* Hover expanded info overlay */}
                <div className="absolute inset-0 bg-black/80 p-3 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-white text-center">
                  <div className="flex items-center justify-center gap-1 mb-2 w-full">
                    <h3 className="font-semibold text-sm line-clamp-1">{prof.full_name}</h3>
                    {prof.is_verified && <BadgeCheck className="text-emerald-400 h-4 w-4 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 mb-2 bg-black/40 px-2 py-0.5 rounded-full text-xs backdrop-blur-sm">
                    <Star className="text-yellow-500 text-[12px]" />
                    <span>{prof.rating_avg?.toFixed(1) || 'Novo'}</span>
                  </div>
                  <div className="text-[10px] mb-2 font-medium bg-primary px-2 py-0.5 rounded text-primary-foreground line-clamp-1">
                    {prof.specialty || 'Personal Trainer'}
                  </div>
                  <div className="flex justify-between w-full text-[10px] sm:text-xs mt-auto px-1 opacity-90">
                    <span>{prof.distance || '2 km'}</span>
                    <span className="font-medium">{prof.price_avg ? `€${prof.price_avg}/h` : '€30/h'}</span>
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
              <Link href={`/espacos/${space.slug || space.id}`} key={space.id} className="relative group aspect-square rounded-xl overflow-hidden bg-muted block shadow-sm hover:shadow-xl hover:z-10 transition-all duration-300">
                <img 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt={space.name} 
                  src={space.gallery_urls?.[0] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'} 
                />
                
                {/* Always visible base overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-0"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300 group-hover:opacity-0">
                  <h3 className="text-white font-semibold text-sm truncate">{space.name}</h3>
                </div>

                {/* Hover expanded info overlay */}
                <div className="absolute inset-0 bg-black/80 p-3 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-white text-center">
                  <h3 className="font-semibold text-sm line-clamp-1 mb-2">{space.name}</h3>
                  <div className="flex items-center gap-1 mb-2 bg-black/40 px-2 py-0.5 rounded-full text-xs backdrop-blur-sm">
                    <Star className="text-yellow-500 text-[12px]" />
                    <span>{space.rating_avg?.toFixed(1) || 'Novo'}</span>
                  </div>
                  <div className="text-[10px] mb-2 font-medium bg-primary px-2 py-0.5 rounded text-primary-foreground line-clamp-1">
                    {space.specialty || 'Multidesportos'}
                  </div>
                  <div className="flex justify-between w-full text-[10px] sm:text-xs mt-auto px-1 opacity-90">
                    <span>{space.distance || '5 km'}</span>
                    <span className="font-medium">{space.price_avg ? `€${space.price_avg}/h` : '€15/h'}</span>
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
