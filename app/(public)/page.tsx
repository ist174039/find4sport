import { Activity, ArrowRight, BadgeCheck, Building2, CalendarDays, MapPin, Rss, Star, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { HeroCarousel } from '@/components/hero-carousel'
import { PageContainer } from '@/components/patterns/page-shell'
import { distanceFrom, parseGeoCookie } from '@/lib/geo'

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

function bump(map: Map<string, number>, key?: unknown) { if (typeof key === 'string' && key) map.set(key, (map.get(key) || 0) + 1) }
function proximityBonus(distance: number | null) { return distance == null ? 0 : Math.max(0, 15 - distance / 3) }

export default async function Page() {
  const supabase = await createClient()
  const admin = createAdminClient()
  const now = new Date().toISOString()
  const cookieStore = await cookies()
  const userLocation = parseGeoCookie(cookieStore.get('f4s_geo')?.value)

  const [spacesCount, profsCount, eventsCount, spacesResult, professionalsResult, eventsResult, carouselRes] = await Promise.all([
    supabase.from('sport_spaces').select('id', { count: 'exact', head: true }).or('status.eq.active,is_verified.eq.true'),
    supabase.from('professionals').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published').gte('start_date', now),
    supabase.from('sport_spaces').select('id,name,slug,address,rating_avg,review_count,gallery_urls,cover_url,is_verified,latitude,longitude,status').eq('is_verified', true).limit(24),
    supabase.from('professionals').select('id,user_id,full_name,professional_name,public_slug,address,rating_avg,review_count,avatar_url,is_verified,status,views_count,latitude,longitude').eq('status', 'active').limit(40),
    supabase.from('events').select('id,title,start_date,address,image_url,status,latitude,longitude').eq('status', 'published').gte('start_date', now).order('start_date', { ascending: true }).limit(24),
    supabase.from('carousel_slides').select('*').eq('is_active', true).order('display_order', { ascending: true }),
  ])

  const candidates = professionalsResult.data || []
  const professionalIds = candidates.map(item => item.id)
  const professionalUserIds = candidates.map(item => item.user_id)
  const [followsResult, completedResult, servicesResult, postsResult, subscriptionsResult] = professionalIds.length ? await Promise.all([
    admin.from('user_follows').select('following_id').in('following_id', professionalUserIds),
    admin.from('reservations').select('professional_id').in('professional_id', professionalIds).eq('status', 'completed'),
    admin.from('services').select('professional_id').in('professional_id', professionalIds).eq('is_active', true),
    admin.from('posts').select('id,professional_id').in('professional_id', professionalIds),
    admin.from('user_subscriptions').select('user_id,tier,status').in('user_id', professionalUserIds),
  ]) : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }] as any

  const postIds = (postsResult.data || []).map((post: any) => post.id)
  const commentsResult = postIds.length ? await admin.from('post_comments').select('post_id').in('post_id', postIds) : { data: [] }
  const followers = new Map<string, number>(); for (const row of followsResult.data || []) bump(followers, row.following_id)
  const completed = new Map<string, number>(); for (const row of completedResult.data || []) bump(completed, row.professional_id)
  const activeServices = new Map<string, number>(); for (const row of servicesResult.data || []) bump(activeServices, row.professional_id)
  const postToProfessional = new Map((postsResult.data || []).map((post: any) => [post.id, post.professional_id]))
  const comments = new Map<string, number>(); for (const row of commentsResult.data || []) bump(comments, postToProfessional.get(row.post_id))
  const planByUser = new Map((subscriptionsResult.data || []).map((subscription: any) => [subscription.user_id, subscription.status === 'active' || subscription.status === 'trialing' ? subscription.tier : 'free']))

  const professionals = candidates.map((prof: any) => {
    const distanceKm = distanceFrom(userLocation, prof.latitude, prof.longitude)
    const plan = String(planByUser.get(prof.user_id) || 'free')
    const qualityScore = Number(prof.rating_avg || 0) * 10
      + Math.min(Number(prof.review_count || 0), 20) * 1.5
      + Math.min(followers.get(prof.user_id) || 0, 50) * 0.5
      + Math.log10(Number(prof.views_count || 0) + 1) * 4
      + Math.min(completed.get(prof.id) || 0, 20) * 2
      + Math.min(comments.get(prof.id) || 0, 20) * 0.5
      + Math.min(activeServices.get(prof.id) || 0, 10)
      + (prof.is_verified ? 3 : 0)
      + (plan === 'premium' ? 5 : plan === 'pro' ? 2 : 0)
    return { ...prof, distanceKm, featuredScore: qualityScore + proximityBonus(distanceKm) }
  }).sort((a, b) => b.featuredScore - a.featuredScore).slice(0, 4)

  const spaces = (spacesResult.data || []).map((space: any) => {
    const distanceKm = distanceFrom(userLocation, space.latitude, space.longitude)
    const score = Number(space.rating_avg || 0) * 10 + Math.min(Number(space.review_count || 0), 30) + proximityBonus(distanceKm)
    return { ...space, distanceKm, score }
  }).sort((a, b) => b.score - a.score).slice(0, 4)

  const events = (eventsResult.data || []).map((event: any) => ({ ...event, distanceKm: distanceFrom(userLocation, event.latitude, event.longitude) })).sort((a, b) => {
    if (userLocation) {
      const da = a.distanceKm ?? Number.POSITIVE_INFINITY
      const db = b.distanceKm ?? Number.POSITIVE_INFINITY
      if (da !== db) return da - db
    }
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  }).slice(0, 4)
  const slides = carouselRes.data || []

  return <div className="flex min-h-screen flex-col bg-background">
    <HeroCarousel slides={slides} spacesCount={spacesCount.count || 0} profsCount={profsCount.count || 0} eventsCount={eventsCount.count || 0} />

    <section className="border-b border-border py-10 sm:py-16"><PageContainer><div className="mb-6 sm:mb-8"><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Explore a plataforma</h2><p className="mt-2 text-sm text-muted-foreground sm:text-base">Escolha diretamente o que procura, sem percursos desnecessários.</p></div><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{ecosystem.map((item) => <Link key={item.href} href={item.href} className="group flex min-h-36 flex-col justify-between rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm sm:min-h-40 sm:p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></div><div><h3 className="font-semibold text-foreground">{item.name}</h3><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p></div></Link>)}</div></PageContainer></section>

    <section className="border-b border-border py-10 sm:py-16"><PageContainer><div className="mb-6 flex items-end justify-between gap-4 sm:mb-8"><div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Profissionais em destaque</h2><p className="mt-2 text-sm text-muted-foreground">Qualidade, atividade, confiança e proximidade — o plano tem apenas um peso reduzido.</p></div><Link href="/profissionais" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">Ver todos <ArrowRight className="h-4 w-4" /></Link></div>{professionals.length ? <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{professionals.map((prof: any) => <Link href={`/profissionais/${prof.public_slug || prof.id}`} key={prof.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/40 hover:shadow-md"><ImageOrFallback src={prof.avatar_url} alt={prof.full_name || prof.professional_name || 'Profissional'} icon={Users} /><div className="p-3 sm:p-4"><div className="flex items-start justify-between gap-1.5"><h3 className="line-clamp-2 text-sm font-semibold leading-tight sm:text-base">{prof.professional_name || prof.full_name || 'Profissional'}</h3>{prof.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />}</div>{prof.address && <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{prof.address}</span></p>}{prof.distanceKm != null && <p className="mt-1 text-[11px] font-medium text-primary">{prof.distanceKm < 1 ? `${Math.round(prof.distanceKm * 1000)} m` : `${prof.distanceKm.toFixed(1)} km`} de ti</p>}{Number(prof.review_count || 0) > 0 && <p className="mt-2 flex items-center gap-1 text-[11px] font-medium sm:text-xs"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{Number(prof.rating_avg || 0).toFixed(1)} <span className="text-muted-foreground">({prof.review_count})</span></p>}</div></Link>)}</div> : <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Ainda não existem profissionais ativos para destacar.</p>}<Link href="/profissionais" className="mt-5 flex min-h-11 items-center justify-center text-sm font-medium text-primary sm:hidden">Ver todos os profissionais</Link></PageContainer></section>

    <section className="border-b border-border bg-muted/20 py-10 sm:py-16"><PageContainer><div className="mb-6 flex items-end justify-between gap-4 sm:mb-8"><div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Espaços em destaque</h2><p className="mt-2 text-sm text-muted-foreground">Reputação registada e proximidade quando a localização está disponível.</p></div><Link href="/espacos" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">Ver todos <ArrowRight className="h-4 w-4" /></Link></div>{spaces.length ? <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{spaces.map((space: any) => <Link href={`/espacos/${space.slug || space.id}`} key={space.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/40 hover:shadow-md"><ImageOrFallback src={space.cover_url || space.gallery_urls?.[0]} alt={space.name} icon={Building2} /><div className="p-3 sm:p-4"><h3 className="line-clamp-2 text-sm font-semibold leading-tight sm:text-base">{space.name}</h3>{space.address && <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{space.address}</span></p>}{space.distanceKm != null && <p className="mt-1 text-[11px] font-medium text-primary">{space.distanceKm < 1 ? `${Math.round(space.distanceKm * 1000)} m` : `${space.distanceKm.toFixed(1)} km`} de ti</p>}{Number(space.review_count || 0) > 0 && <p className="mt-2 flex items-center gap-1 text-[11px] font-medium sm:text-xs"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{Number(space.rating_avg || 0).toFixed(1)} <span className="text-muted-foreground">({space.review_count})</span></p>}</div></Link>)}</div> : <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Ainda não existem espaços verificados para destacar.</p>}<Link href="/espacos" className="mt-5 flex min-h-11 items-center justify-center text-sm font-medium text-primary sm:hidden">Ver todos os espaços</Link></PageContainer></section>

    <section className="py-10 sm:py-16"><PageContainer><div className="mb-6 flex items-end justify-between gap-4 sm:mb-8"><div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Próximos eventos</h2><p className="mt-2 text-sm text-muted-foreground">Eventos futuros próximos de ti quando existe localização disponível.</p></div><Link href="/eventos" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">Ver agenda <ArrowRight className="h-4 w-4" /></Link></div>{events.length ? <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">{events.map((event: any) => <Link href={`/eventos/${event.id}`} key={event.id} className="group rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-sm sm:p-5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-11 sm:w-11"><CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" /></div><h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-tight sm:mt-4 sm:text-base">{event.title}</h3><p className="mt-2 text-[11px] text-muted-foreground sm:text-sm">{new Date(event.start_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}</p>{event.address && <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{event.address}</span></p>}{event.distanceKm != null && <p className="mt-1 text-[11px] font-medium text-primary">{event.distanceKm < 1 ? `${Math.round(event.distanceKm * 1000)} m` : `${event.distanceKm.toFixed(1)} km`} de ti</p>}</Link>)}</div> : <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Não existem eventos futuros publicados neste momento.</p>}</PageContainer></section>
  </div>
}
