import type { Metadata } from 'next'
import { Activity, ArrowRight, BadgeCheck, Building2, CalendarDays, HeartPulse, MapPin, Rss, Star, Users } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { HeroCarousel } from '@/components/hero-carousel'
import { HomeCardImage } from '@/components/home/home-card-image'
import { PageContainer } from '@/components/patterns/page-shell'
import { createClient } from '@/lib/supabase/server'
import { parseGeoCookie } from '@/lib/geo'
import { PUBLIC_EVENT_STATUS, PUBLIC_PROFESSIONAL_STATUS, PUBLIC_SPACE_STATUS } from '@/lib/domain/public-entities'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Desporto perto de si',
  description: 'Descubra profissionais, espaços, eventos e comunidades desportivas em Portugal.',
  alternates: { canonical: '/' },
  openGraph: { title: 'FIND4SPORT — Desporto perto de si', description: 'Descubra profissionais, espaços, eventos e comunidades desportivas em Portugal.', url: '/', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'FIND4SPORT — Desporto perto de si', description: 'Descubra profissionais, espaços, eventos e comunidades desportivas em Portugal.' },
}

const ecosystem = [
  { name: 'Profissionais', description: 'Treino, recuperação e acompanhamento', href: '/profissionais', icon: Users },
  { name: 'Espaços', description: 'Instalações e campos desportivos', href: '/espacos', icon: Building2 },
  { name: 'Eventos', description: 'Provas, aulas e encontros', href: '/eventos', icon: CalendarDays },
  { name: 'Comunidades', description: 'Grupos e interesses desportivos', href: '/comunidades', icon: Users },
  { name: 'Saúde', description: 'Fisioterapia, recuperação e bem-estar', href: '/pesquisa?q=saúde&type=profissionais', icon: HeartPulse },
  { name: 'Feed', description: 'Conteúdo da comunidade profissional', href: '/feed', icon: Rss },
  { name: 'Pesquisa', description: 'Encontra tudo num só lugar', href: '/pesquisa', icon: Activity },
]

type ProfessionalCard = { id: string; full_name?: string | null; professional_name?: string | null; public_slug?: string | null; address?: string | null; rating_avg?: number | string | null; review_count?: number | null; avatar_url?: string | null; is_verified?: boolean | null; distanceKm?: number | null; averagePrice?: number | null }
type SpaceCard = { id: string; name: string; slug?: string | null; address?: string | null; cover_url?: string | null; gallery_urls?: unknown; distanceKm?: number | null; averagePrice?: number | null }
type EventCard = { id: string; slug?: string | null; title: string; start_date: string; price_min?: number | string | null; distanceKm?: number | null }
type CommunityCard = { id: string; slug?: string | null; name: string; description?: string | null; cover_url?: string | null; memberCount?: number | null }
type DiscoveryRow<T> = { item: T; total_count: number | string }
type RpcResponse = { data: unknown; error: { message: string } | null }
type CountResponse = { count: number | null; error: unknown }

function rows<T>(result: PromiseSettledResult<RpcResponse>) {
  if (result.status === 'rejected' || result.value.error) return { items: [] as T[], failed: true }
  return { items: ((Array.isArray(result.value.data) ? result.value.data : []) as DiscoveryRow<T>[]).map(row => row.item), failed: false }
}

function resultCount(result: PromiseSettledResult<CountResponse>) {
  return result.status === 'fulfilled' && !result.value.error ? result.value.count || 0 : 0
}

function distance(value?: number | null) {
  return value == null ? null : value < 1 ? `${Math.round(value * 1000)} m de ti` : `${value.toFixed(1)} km de ti`
}

function money(value: number) { return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value) }
function galleryCover(value: unknown) { return Array.isArray(value) && typeof value[0] === 'string' ? value[0] : null }

function SectionHeading({ title, description, href }: { title: string; description: string; href: string }) {
  return <div className="mb-6 flex items-end justify-between gap-4"><div><h2 className="text-2xl font-bold sm:text-3xl">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{description}</p></div><Link href={href} className="hidden shrink-0 text-sm font-medium text-primary sm:flex">Ver todos <ArrowRight className="ml-1 h-4 w-4" /></Link></div>
}

function SectionState({ failed, empty, label, href }: { failed: boolean; empty: boolean; label: string; href: string }) {
  if (!failed && !empty) return null
  return <div className="rounded-2xl border border-dashed bg-muted/20 px-5 py-10 text-center"><h3 className="font-semibold">{failed ? `Não foi possível carregar ${label}` : `Ainda não existem ${label}`}</h3><p className="mt-2 text-sm text-muted-foreground">{failed ? 'Pode tentar novamente ou continuar para a listagem completa.' : 'Explore a área completa e volte em breve para encontrar novidades.'}</p><div className="mt-4 flex justify-center gap-3"><Link href="/" className="text-sm font-medium text-primary">Tentar novamente</Link><Link href={href} className="text-sm font-medium text-primary">Abrir listagem</Link></div></div>
}

export default async function Page() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userLocation = parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const now = new Date().toISOString()
  const rpc = supabase.rpc.bind(supabase) as unknown as (name: string, args: Record<string, unknown>) => PromiseLike<RpcResponse>

  const [spacesCount, profsCount, eventsCount, athletesCount, communitiesCount, carouselResult, proResult, spaceResult, eventResult, communityResult] = await Promise.allSettled([
    supabase.from('sport_spaces').select('id', { count: 'exact', head: true }).eq('status', PUBLIC_SPACE_STATUS),
    supabase.from('professionals').select('id', { count: 'exact', head: true }).eq('status', PUBLIC_PROFESSIONAL_STATUS),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', PUBLIC_EVENT_STATUS).gte('start_date', now),
    supabase.from('platform_users').select('id', { count: 'exact', head: true }).eq('type', 'athlete').eq('account_status', 'active'),
    supabase.from('communities').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('carousel_slides').select('id,image_url,title,subtitle,button_text,button_link').eq('is_active', true).order('display_order', { ascending: true }),
    rpc('discover_professionals', { p_lat: userLocation?.latitude ?? null, p_lng: userLocation?.longitude ?? null, p_sort: userLocation ? 'distance' : 'rating', p_offset: 0, p_limit: 6 }),
    rpc('discover_spaces', { p_lat: userLocation?.latitude ?? null, p_lng: userLocation?.longitude ?? null, p_sort: userLocation ? 'distance' : 'rating', p_offset: 0, p_limit: 6 }),
    rpc('discover_events', { p_lat: userLocation?.latitude ?? null, p_lng: userLocation?.longitude ?? null, p_date_from: now, p_sort: 'upcoming', p_offset: 0, p_limit: 6 }),
    rpc('discover_communities', { p_lat: userLocation?.latitude ?? null, p_lng: userLocation?.longitude ?? null, p_sort: userLocation ? 'distance' : 'members', p_offset: 0, p_limit: 6 }),
  ])

  const carousel = carouselResult.status === 'fulfilled' && !carouselResult.value.error ? carouselResult.value.data || [] : []
  const professionals = rows<ProfessionalCard>(proResult)
  const spaces = rows<SpaceCard>(spaceResult)
  const events = rows<EventCard>(eventResult)
  const communities = rows<CommunityCard>(communityResult)

  return <div className="flex min-h-screen flex-col bg-background">
    <HeroCarousel slides={carousel} spacesCount={resultCount(spacesCount)} profsCount={resultCount(profsCount)} eventsCount={resultCount(eventsCount)} athletesCount={resultCount(athletesCount)} communitiesCount={resultCount(communitiesCount)} />
    <section className="border-b py-10 sm:py-16"><PageContainer><h2 className="text-2xl font-bold sm:text-3xl">Explore a plataforma</h2><p className="mt-2 text-sm text-muted-foreground">Acede diretamente ao que procuras.</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">{ecosystem.map(item => <Link key={item.href} href={item.href} className="flex min-h-32 flex-col justify-between rounded-2xl border bg-card p-4 transition hover:border-primary/40"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></div><div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p></div></Link>)}</div></PageContainer></section>

    <section className="border-b py-10 sm:py-16"><PageContainer><SectionHeading title="Profissionais recomendados" description="Proximidade e reputação, sem misturar promoção paga no ranking." href="/profissionais" /><SectionState failed={professionals.failed} empty={!professionals.items.length} label="profissionais" href="/profissionais" />{!professionals.failed && professionals.items.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{professionals.items.map(pro => <Link href={`/profissionais/${pro.public_slug || pro.id}`} key={pro.id} className="overflow-hidden rounded-2xl border bg-card transition hover:border-primary/40"><HomeCardImage src={pro.avatar_url} alt={pro.professional_name || pro.full_name || 'Profissional'} icon={Users} /><div className="p-3"><div className="flex gap-1"><h3 className="line-clamp-2 flex-1 text-sm font-semibold">{pro.professional_name || pro.full_name || 'Profissional'}</h3>{pro.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />}</div>{pro.address && <p className="mt-2 flex items-center gap-1 truncate text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" />{pro.address}</p>}{distance(pro.distanceKm) && <p className="mt-1 text-[11px] font-medium text-primary">{distance(pro.distanceKm)}</p>}{pro.averagePrice != null && <p className="mt-1 text-[11px] font-semibold">Média {money(pro.averagePrice)} / sessão</p>}{Number(pro.review_count || 0) > 0 && <p className="mt-2 flex items-center gap-1 text-[11px]"><Star className="h-3 w-3 fill-amber-500 text-amber-500" />{Number(pro.rating_avg || 0).toFixed(1)} ({pro.review_count})</p>}</div></Link>)}</div>}</PageContainer></section>

    <section className="border-b bg-muted/20 py-10 sm:py-16"><PageContainer><SectionHeading title="Espaços próximos" description="Instalações ativas ordenadas por proximidade ou reputação." href="/espacos" /><SectionState failed={spaces.failed} empty={!spaces.items.length} label="espaços" href="/espacos" />{!spaces.failed && spaces.items.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{spaces.items.map(space => <Link href={`/espacos/${space.slug || space.id}`} key={space.id} className="overflow-hidden rounded-2xl border bg-card transition hover:border-primary/40"><HomeCardImage src={space.cover_url || galleryCover(space.gallery_urls)} alt={space.name} icon={Building2} /><div className="p-3"><h3 className="line-clamp-2 text-sm font-semibold">{space.name}</h3>{space.address && <p className="mt-2 truncate text-[11px] text-muted-foreground">{space.address}</p>}{distance(space.distanceKm) && <p className="mt-1 text-[11px] font-medium text-primary">{distance(space.distanceKm)}</p>}{space.averagePrice != null && <p className="mt-1 text-[11px] font-semibold">Média {money(space.averagePrice)} / hora</p>}</div></Link>)}</div>}</PageContainer></section>

    <section className="border-b py-10 sm:py-16"><PageContainer><SectionHeading title="Próximos eventos" description="Eventos publicados e futuros, ordenados cronologicamente em UTC." href="/eventos" /><SectionState failed={events.failed} empty={!events.items.length} label="eventos futuros" href="/eventos" />{!events.failed && events.items.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{events.items.map(event => <Link href={`/eventos/${event.slug || event.id}`} key={event.id} className="rounded-2xl border bg-card p-3 transition hover:border-primary/40"><CalendarDays className="h-5 w-5 text-primary" /><h3 className="mt-3 line-clamp-2 text-sm font-semibold">{event.title}</h3><p className="mt-2 text-[11px] text-muted-foreground">{new Date(event.start_date).toLocaleDateString('pt-PT', { timeZone: 'UTC' })}</p>{distance(event.distanceKm) && <p className="mt-1 text-[11px] font-medium text-primary">{distance(event.distanceKm)}</p>}{Number(event.price_min || 0) > 0 ? <p className="mt-1 text-[11px] font-semibold">Desde {money(Number(event.price_min))}</p> : <p className="mt-1 text-[11px] font-semibold">Grátis</p>}</Link>)}</div>}</PageContainer></section>

    <section className="bg-muted/20 py-10 sm:py-16"><PageContainer><SectionHeading title="Comunidades em destaque" description="Grupos públicos e comunidades a que já tem acesso, com navegação independente." href="/comunidades" /><SectionState failed={communities.failed} empty={!communities.items.length} label="comunidades" href="/comunidades" />{!communities.failed && communities.items.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{communities.items.map(community => <Link href={`/comunidades/${community.slug || community.id}`} key={community.id} className="overflow-hidden rounded-2xl border bg-card transition hover:border-primary/40"><HomeCardImage src={community.cover_url} alt={community.name} icon={Users} /><div className="p-3"><h3 className="line-clamp-2 text-sm font-semibold">{community.name}</h3><p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">{community.description || 'Comunidade desportiva na Find4Sport.'}</p><p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary"><Users className="h-3 w-3" />{community.memberCount || 0} membros</p></div></Link>)}</div>}</PageContainer></section>
  </div>
}
