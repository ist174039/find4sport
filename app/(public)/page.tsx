import { Activity, ArrowRight, BadgeCheck, Building2, CalendarDays, MapPin, Rss, Star, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { HeroCarousel } from '@/components/hero-carousel'
import { PageContainer } from '@/components/patterns/page-shell'

const ecosystem = [
  { name: 'Profissionais', description: 'Treino, recuperação e acompanhamento', href: '/profissionais', icon: Users },
  { name: 'Espaços', description: 'Instalações e campos desportivos', href: '/espacos', icon: Building2 },
  { name: 'Eventos', description: 'Provas, aulas e encontros', href: '/eventos', icon: CalendarDays },
  { name: 'Comunidades', description: 'Grupos e interesses desportivos', href: '/comunidades', icon: Users },
  { name: 'Feed', description: 'Conteúdo da comunidade profissional', href: '/feed', icon: Rss },
  { name: 'Pesquisa', description: 'Encontre o que precisa num só lugar', href: '/pesquisa', icon: Activity },
]

function ImageOrFallback({ src, alt, icon: Icon }: { src?: string | null; alt: string; icon: typeof Users }) {
  return <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-secondary/20">{src ? <img src={src} alt={alt} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center"><Icon className="h-10 w-10 text-primary/35 sm:h-12 sm:w-12" /></div>}</div>
}

export default async function Page() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const [spacesCount, profsCount, eventsCount, popularSpaces, topProfessionals, upcomingEvents, carouselRes] = await Promise.all([
    supabase.from('sport_spaces').select('id', { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('professionals').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published').gte('start_date', now),
    supabase.from('sport_spaces').select('id,name,slug,address,rating_avg,review_count,gallery_urls,cover_url,is_verified').eq('is_verified', true).order('review_count', { ascending: false }).limit(4),
    supabase.from('professionals').select('id,full_name,professional_name,public_slug,address,location,rating_avg,review_count,avatar_url,is_verified,status').eq('status', 'active').order('rating_avg', { ascending: false }).limit(4),
    supabase.from('events').select('id,title,start_date,address,image_url,status').eq('status', 'published').gte('start_date', now).order('start_date', { ascending: true }).limit(4),
    supabase.from('carousel_slides').select('*').eq('is_active', true).order('display_order', { ascending: true }),
  ])

  const spaces = popularSpaces.data || []
  const professionals = topProfessionals.data || []
  const events = upcomingEvents.data || []
  const slides = carouselRes.data || []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HeroCarousel slides={slides} spacesCount={spacesCount.count || 0} profsCount={profsCount.count || 0} eventsCount={eventsCount.count || 0} />

      <section className="border-b border-border py-10 sm:py-16"><PageContainer><div className="mb-6 sm:mb-8"><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Explore a plataforma</h2><p className="mt-2 text-sm text-muted-foreground sm:text-base">Escolha diretamente o que procura, sem percursos desnecessários.</p></div><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{ecosystem.map((item) => <Link key={item.href} href={item.href} className="group flex min-h-36 flex-col justify-between rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm sm:min-h-40 sm:p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></div><div><h3 className="font-semibold text-foreground">{item.name}</h3><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p></div></Link>)}</div></PageContainer></section>

      <section className="border-b border-border py-10 sm:py-16"><PageContainer><div className="mb-6 flex items-end justify-between gap-4 sm:mb-8"><div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Profissionais em destaque</h2><p className="mt-2 text-sm text-muted-foreground">Profissionais ativos ordenados pela reputação registada.</p></div><Link href="/profissionais" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">Ver todos <ArrowRight className="h-4 w-4" /></Link></div>{professionals.length ? <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{professionals.map((prof: any) => <Link href={`/profissionais/${prof.public_slug || prof.id}`} key={prof.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/40 hover:shadow-md"><ImageOrFallback src={prof.avatar_url} alt={prof.full_name || prof.professional_name || 'Profissional'} icon={Users} /><div className="p-3 sm:p-4"><div className="flex items-start justify-between gap-1.5"><h3 className="line-clamp-2 text-sm font-semibold leading-tight sm:text-base">{prof.professional_name || prof.full_name || 'Profissional'}</h3>{prof.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />}</div>{(prof.location || prof.address) && <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{prof.location || prof.address}</span></p>}{Number(prof.review_count || 0) > 0 && <p className="mt-2 flex items-center gap-1 text-[11px] font-medium sm:text-xs"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{Number(prof.rating_avg || 0).toFixed(1)} <span className="text-muted-foreground">({prof.review_count})</span></p>}</div></Link>)}</div> : <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Ainda não existem profissionais ativos para destacar.</p>}<Link href="/profissionais" className="mt-5 flex min-h-11 items-center justify-center text-sm font-medium text-primary sm:hidden">Ver todos os profissionais</Link></PageContainer></section>

      <section className="border-b border-border bg-muted/20 py-10 sm:py-16"><PageContainer><div className="mb-6 flex items-end justify-between gap-4 sm:mb-8"><div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Espaços em destaque</h2><p className="mt-2 text-sm text-muted-foreground">Espaços verificados ordenados pela reputação registada.</p></div><Link href="/espacos" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">Ver todos <ArrowRight className="h-4 w-4" /></Link></div>{spaces.length ? <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{spaces.map((space: any) => <Link href={`/espacos/${space.slug || space.id}`} key={space.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/40 hover:shadow-md"><ImageOrFallback src={space.cover_url || space.gallery_urls?.[0]} alt={space.name} icon={Building2} /><div className="p-3 sm:p-4"><h3 className="line-clamp-2 text-sm font-semibold leading-tight sm:text-base">{space.name}</h3>{space.address && <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{space.address}</span></p>}{Number(space.review_count || 0) > 0 && <p className="mt-2 flex items-center gap-1 text-[11px] font-medium sm:text-xs"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{Number(space.rating_avg || 0).toFixed(1)} <span className="text-muted-foreground">({space.review_count})</span></p>}</div></Link>)}</div> : <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Ainda não existem espaços verificados para destacar.</p>}<Link href="/espacos" className="mt-5 flex min-h-11 items-center justify-center text-sm font-medium text-primary sm:hidden">Ver todos os espaços</Link></PageContainer></section>

      <section className="py-10 sm:py-16"><PageContainer><div className="mb-6 flex items-end justify-between gap-4 sm:mb-8"><div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Próximos eventos</h2><p className="mt-2 text-sm text-muted-foreground">Eventos publicados com data futura.</p></div><Link href="/eventos" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">Ver agenda <ArrowRight className="h-4 w-4" /></Link></div>{events.length ? <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">{events.map((event: any) => <Link href={`/eventos/${event.id}`} key={event.id} className="group rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-sm sm:p-5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-11 sm:w-11"><CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" /></div><h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-tight sm:mt-4 sm:text-base">{event.title}</h3><p className="mt-2 text-[11px] text-muted-foreground sm:text-sm">{new Date(event.start_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}</p>{event.address && <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{event.address}</span></p>}</Link>)}</div> : <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Não existem eventos futuros publicados neste momento.</p>}</PageContainer></section>
    </div>
  )
}
