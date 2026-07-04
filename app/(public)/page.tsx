import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { HeroCarousel } from '@/components/hero-carousel'

export default async function Page() {
  const supabase = await createClient()

  const [spacesCount, profsCount, eventsCount, popularSpaces, topProfessionals, carouselRes] = await Promise.all([
    supabase.from('sport_spaces').select('id', { count: 'exact', head: true }),
    supabase.from('professionals').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('sport_spaces').select('*').order('review_count', { ascending: false }).limit(4),
    supabase.from('professionals').select('*').order('rating_avg', { ascending: false }).limit(4),
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
            <Link href="/pesquisa?type=spaces" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">apartment</span>
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Espaços</h3>
              <p className="text-xs text-muted-foreground">Reserva online</p>
            </Link>
            <Link href="/pesquisa" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">person_celebrate</span>
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Profissionais</h3>
              <p className="text-xs text-muted-foreground">PT, fisio, nutrição</p>
            </Link>
            <Link href="/pesquisa?category=saude" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-md hover:border-pink-500/50 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">favorite</span>
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Saúde</h3>
              <p className="text-xs text-muted-foreground">Recovery & bem-estar</p>
            </Link>
            <Link href="/pesquisa?category=viagens" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-md hover:border-orange-500/50 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">kayaking</span>
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Viagens</h3>
              <p className="text-xs text-muted-foreground">Desporto aventura</p>
            </Link>
            <Link href="/pesquisa?category=marketplace" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-md hover:border-purple-500/50 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">shopping_bag</span>
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Marketplace</h3>
              <p className="text-xs text-muted-foreground">Equipamento</p>
            </Link>
            <Link href="/comunidades" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">forum</span>
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Comunidade</h3>
              <p className="text-xs text-muted-foreground">Inspire-se</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Professionals */}
      <section className="py-16 sm:py-24 bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Top Profissionais</h2>
              <p className="mt-2 text-muted-foreground">Os profissionais mais reconhecidos da nossa rede</p>
            </div>
            <Link href="/pesquisa" className="hidden sm:flex text-primary font-medium text-sm items-center gap-1 hover:underline">
              Ver todos <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {profs.map((prof) => (
              <Link href={`/profissionais/${prof.public_slug || prof.id}`} key={prof.id} className="flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group p-4">
                <div className="relative aspect-square rounded-full w-24 h-24 mx-auto mt-4 overflow-hidden bg-muted border-2 border-border group-hover:border-primary/50 transition-colors">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    alt={prof.full_name} 
                    src={prof.avatar_url || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=640&auto=format&fit=crop'} 
                  />
                  {prof.is_verified && (
                    <span className="absolute bottom-1 right-1 bg-emerald-100 text-emerald-700 p-0.5 rounded-full border border-emerald-200 material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  )}
                </div>
                <div className="pt-4 flex-1 flex flex-col items-center text-center">
                  <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">{prof.full_name}</h3>
                  <div className="flex items-center gap-1 mt-1 bg-muted px-2 py-0.5 rounded-md text-xs">
                    <span className="material-symbols-outlined text-yellow-500 text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-semibold text-foreground">{prof.rating_avg?.toFixed(1) || 'Novo'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-3 flex-1">
                    {prof.bio || 'Especialista em desporto e performance.'}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border w-full">
                    <span className="text-primary font-medium text-sm">Ver perfil</span>
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
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Espaços Populares</h2>
              <p className="mt-2 text-muted-foreground">Os espaços desportivos mais bem avaliados pela comunidade</p>
            </div>
            <Link href="/pesquisa?type=spaces" className="hidden sm:flex text-primary font-medium text-sm items-center gap-1 hover:underline">
              Ver todos <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {spaces.map((space) => (
              <Link href={`/espacos/${space.slug || space.id}`} key={space.id} className="flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative aspect-[4/3] bg-muted">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    alt={space.name} 
                    src={space.gallery_urls?.[0] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'} 
                  />
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-yellow-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-semibold text-xs text-foreground">{space.rating_avg?.toFixed(1) || 'Novo'}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">{space.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 truncate">
                    <span className="material-symbols-outlined text-[16px]">location_on</span> {space.address || 'Localização não disponível'}
                  </p>
                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <span className="text-primary font-medium text-sm">Ver detalhes</span>
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
