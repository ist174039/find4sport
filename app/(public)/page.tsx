import { Activity, ArrowRight, BadgeCheck, Building2, CalendarDays, HeartPulse, MapPin, Rss, Star, Users } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { HeroCarousel } from '@/components/hero-carousel'
import { PageContainer } from '@/components/patterns/page-shell'
import { AppImage } from '@/components/ui/app-image'
import { distanceFrom, parseGeoCookie } from '@/lib/geo'
import { PUBLIC_EVENT_STATUS, PUBLIC_PROFESSIONAL_STATUS, PUBLIC_SPACE_STATUS } from '@/lib/domain/public-entities'

export const dynamic = 'force-dynamic'

const ecosystem = [
  { name: 'Profissionais', description: 'Treino, recuperação e acompanhamento', href: '/profissionais', icon: Users },
  { name: 'Espaços', description: 'Instalações e campos desportivos', href: '/espacos', icon: Building2 },
  { name: 'Eventos', description: 'Provas, aulas e encontros', href: '/eventos', icon: CalendarDays },
  { name: 'Comunidades', description: 'Grupos e interesses desportivos', href: '/comunidades', icon: Users },
  { name: 'Saúde', description: 'Fisioterapia, recuperação e bem-estar', href: '/pesquisa?q=saúde&type=profissionais', icon: HeartPulse },
  { name: 'Feed', description: 'Conteúdo da comunidade profissional', href: '/feed', icon: Rss },
  { name: 'Pesquisa', description: 'Encontra tudo num só lugar', href: '/pesquisa', icon: Activity },
]

type ProfessionalRow = { id: string; user_id: string | null; full_name: string | null; professional_name: string | null; public_slug: string | null; address: string | null; rating_avg: number | string | null; review_count: number | null; avatar_url: string | null; is_verified: boolean | null; status: string | null; views_count: number | null; latitude: number | null; longitude: number | null }
type SpaceRow = { id: string; name: string; slug: string | null; address: string | null; rating_avg: number | string | null; review_count: number | null; gallery_urls: unknown; cover_url: string | null; is_verified: boolean | null; latitude: number | null; longitude: number | null; status: string | null }
type EventRow = { id: string; slug: string | null; title: string; start_date: string; address: string | null; image_url: string | null; status: string | null; latitude: number | null; longitude: number | null; price_min: number | string | null }
type ServicePriceRow = { professional_id: string; price: number | string | null }
type RoomPriceRow = { space_id: string; price_per_hour: number | string | null }
type ProfessionalCard = ProfessionalRow & { distanceKm: number | null; averagePrice: number | null }
type SpaceCard = SpaceRow & { distanceKm: number | null; averagePrice: number | null }
type EventCard = EventRow & { distanceKm: number | null }

function ImageOrFallback({ src, alt, icon: Icon }: { src?: string | null; alt: string; icon: typeof Users }) {
  return <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-secondary/20">{src ? <AppImage src={src} alt={alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 16vw" className="object-cover" /> : <div className="flex h-full items-center justify-center"><Icon className="h-10 w-10 text-primary/35" /></div>}</div>
}
function average(values: number[]) { return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null }
function money(value: number) { return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value) }
function galleryCover(value: unknown) { return Array.isArray(value) && typeof value[0] === 'string' ? value[0] : null }

export default async function Page() {
  const admin = createAdminClient()
  const now = new Date().toISOString()
  const cookieStore = await cookies()
  const userLocation = parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const [spacesCount, profsCount, eventsCount, spacesResult, prosResult, eventsResult, carouselRes] = await Promise.all([
    admin.from('sport_spaces').select('id', { count: 'exact', head: true }).eq('status', PUBLIC_SPACE_STATUS),
    admin.from('professionals').select('id', { count: 'exact', head: true }).eq('status', PUBLIC_PROFESSIONAL_STATUS),
    admin.from('events').select('id', { count: 'exact', head: true }).eq('status', PUBLIC_EVENT_STATUS).gte('start_date', now),
    admin.from('sport_spaces').select('id,name,slug,address,rating_avg,review_count,gallery_urls,cover_url,is_verified,latitude,longitude,status').eq('status', PUBLIC_SPACE_STATUS).limit(80),
    admin.from('professionals').select('id,user_id,full_name,professional_name,public_slug,address,rating_avg,review_count,avatar_url,is_verified,status,views_count,latitude,longitude').eq('status', PUBLIC_PROFESSIONAL_STATUS).limit(120),
    admin.from('events').select('id,slug,title,start_date,address,image_url,status,latitude,longitude,price_min').eq('status', PUBLIC_EVENT_STATUS).gte('start_date', now).order('start_date', { ascending: true }).limit(80),
    admin.from('carousel_slides').select('*').eq('is_active', true).order('display_order', { ascending: true }),
  ])
  const pros = (prosResult.data || []) as ProfessionalRow[]
  const spacesRows = (spacesResult.data || []) as SpaceRow[]
  const eventRows = (eventsResult.data || []) as EventRow[]
  const proIds = pros.map(pro => pro.id)
  const spaceIds = spacesRows.map(space => space.id)
  const [services, roomPrices] = await Promise.all([
    proIds.length ? admin.from('services').select('professional_id,price').in('professional_id', proIds).eq('is_active', true) : Promise.resolve({ data: [] as ServicePriceRow[] }),
    spaceIds.length ? admin.from('space_rooms').select('space_id,price_per_hour').in('space_id', spaceIds).eq('is_active', true) : Promise.resolve({ data: [] as RoomPriceRow[] }),
  ])
  const servicePrices = new Map<string, number[]>()
  const spacePrices = new Map<string, number[]>()
  for (const row of (services.data || []) as ServicePriceRow[]) { const price = Number(row.price); if (Number.isFinite(price) && price >= 0) servicePrices.set(row.professional_id, [...(servicePrices.get(row.professional_id) || []), price]) }
  for (const row of (roomPrices.data || []) as RoomPriceRow[]) { const price = Number(row.price_per_hour); if (Number.isFinite(price) && price >= 0) spacePrices.set(row.space_id, [...(spacePrices.get(row.space_id) || []), price]) }

  const professionals: ProfessionalCard[] = pros.map(pro => ({ ...pro, distanceKm: distanceFrom(userLocation, pro.latitude, pro.longitude), averagePrice: average(servicePrices.get(pro.id) || []) })).sort((a, b) => { if (userLocation) { const distance = (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity); if (distance) return distance } return Number(b.rating_avg || 0) - Number(a.rating_avg || 0) }).slice(0, 6)
  const spaces: SpaceCard[] = spacesRows.map(space => ({ ...space, distanceKm: distanceFrom(userLocation, space.latitude, space.longitude), averagePrice: average(spacePrices.get(space.id) || []) })).sort((a, b) => { if (userLocation) { const distance = (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity); if (distance) return distance } return Number(b.rating_avg || 0) - Number(a.rating_avg || 0) }).slice(0, 6)
  const events: EventCard[] = eventRows.map(event => ({ ...event, distanceKm: distanceFrom(userLocation, event.latitude, event.longitude) })).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()).slice(0, 6)
  const distance = (value: number | null | undefined) => value == null ? null : value < 1 ? `${Math.round(value * 1000)} m de ti` : `${value.toFixed(1)} km de ti`

  return <div className="flex min-h-screen flex-col bg-background"><HeroCarousel slides={carouselRes.data || []} spacesCount={spacesCount.count || 0} profsCount={profsCount.count || 0} eventsCount={eventsCount.count || 0} />
    <section className="border-b py-10 sm:py-16"><PageContainer><h2 className="text-2xl font-bold sm:text-3xl">Explore a plataforma</h2><p className="mt-2 text-sm text-muted-foreground">Acede diretamente ao que procuras.</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">{ecosystem.map(item => <Link key={item.href} href={item.href} className="flex min-h-32 flex-col justify-between rounded-2xl border bg-card p-4 transition hover:border-primary/40"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></div><div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p></div></Link>)}</div></PageContainer></section>
    <section className="border-b py-10 sm:py-16"><PageContainer><div className="mb-6 flex items-end justify-between"><div><h2 className="text-2xl font-bold sm:text-3xl">Profissionais recomendados</h2><p className="mt-2 text-sm text-muted-foreground">Proximidade e reputação, sem misturar promoção paga no ranking.</p></div><Link href="/profissionais" className="hidden text-sm font-medium text-primary sm:flex">Ver todos <ArrowRight className="ml-1 h-4 w-4" /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{professionals.map(pro => <Link href={`/profissionais/${pro.public_slug || pro.id}`} key={pro.id} className="overflow-hidden rounded-2xl border bg-card transition hover:border-primary/40"><ImageOrFallback src={pro.avatar_url} alt={pro.professional_name || pro.full_name || 'Profissional'} icon={Users} /><div className="p-3"><div className="flex gap-1"><h3 className="line-clamp-2 flex-1 text-sm font-semibold">{pro.professional_name || pro.full_name}</h3>{pro.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />}</div>{pro.address && <p className="mt-2 flex items-center gap-1 truncate text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" />{pro.address}</p>}{distance(pro.distanceKm) && <p className="mt-1 text-[11px] font-medium text-primary">{distance(pro.distanceKm)}</p>}{pro.averagePrice != null && <p className="mt-1 text-[11px] font-semibold">Média {money(pro.averagePrice)} / sessão</p>}{Number(pro.review_count || 0) > 0 && <p className="mt-2 flex items-center gap-1 text-[11px]"><Star className="h-3 w-3 fill-amber-500 text-amber-500" />{Number(pro.rating_avg || 0).toFixed(1)} ({pro.review_count})</p>}</div></Link>)}</div></PageContainer></section>
    <section className="border-b bg-muted/20 py-10 sm:py-16"><PageContainer><h2 className="mb-6 text-2xl font-bold sm:text-3xl">Espaços próximos</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{spaces.map(space => <Link href={`/espacos/${space.slug || space.id}`} key={space.id} className="overflow-hidden rounded-2xl border bg-card transition hover:border-primary/40"><ImageOrFallback src={space.cover_url || galleryCover(space.gallery_urls)} alt={space.name} icon={Building2} /><div className="p-3"><h3 className="line-clamp-2 text-sm font-semibold">{space.name}</h3>{space.address && <p className="mt-2 truncate text-[11px] text-muted-foreground">{space.address}</p>}{distance(space.distanceKm) && <p className="mt-1 text-[11px] font-medium text-primary">{distance(space.distanceKm)}</p>}{space.averagePrice != null && <p className="mt-1 text-[11px] font-semibold">Média {money(space.averagePrice)} / hora</p>}</div></Link>)}</div></PageContainer></section>
    <section className="py-10 sm:py-16"><PageContainer><h2 className="mb-6 text-2xl font-bold sm:text-3xl">Próximos eventos</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{events.map(event => <Link href={`/eventos/${event.slug || event.id}`} key={event.id} className="rounded-2xl border bg-card p-3 transition hover:border-primary/40"><CalendarDays className="h-5 w-5 text-primary" /><h3 className="mt-3 line-clamp-2 text-sm font-semibold">{event.title}</h3><p className="mt-2 text-[11px] text-muted-foreground">{new Date(event.start_date).toLocaleDateString('pt-PT')}</p>{distance(event.distanceKm) && <p className="mt-1 text-[11px] font-medium text-primary">{distance(event.distanceKm)}</p>}{Number(event.price_min || 0) > 0 ? <p className="mt-1 text-[11px] font-semibold">Desde {money(Number(event.price_min))}</p> : <p className="mt-1 text-[11px] font-semibold">Grátis</p>}</Link>)}</div></PageContainer></section>
  </div>
}
