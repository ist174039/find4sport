import { ArrowRight, Building2, CalendarDays, MapPin, Search, Star, UserRound, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PesquisaFiltros } from '@/components/pesquisa-filtros'
import { PesquisaMapWrapper } from '@/components/pesquisa-map-wrapper'
import { PesquisaLayout } from '@/components/pesquisa-layout'
import { Badge } from '@/components/ui/badge'

export interface UnifiedResultItem {
  id: string
  itemType: 'space' | 'professional' | 'event' | 'community'
  title: string
  subtitle: string
  address: string
  rating_avg: number | null
  review_count: number | null
  is_verified: boolean
  image_url?: string | null
  link: string
  created_at?: string | null
  start_date?: string | null
  latitude?: number | null
  longitude?: number | null
}

const typeAliases: Record<string, string> = { spaces: 'espacos', professionals: 'profissionais', events: 'eventos', communities: 'comunidades', all: 'todos' }

function ResultImage({ item }: { item: UnifiedResultItem }) {
  const Icon = item.itemType === 'space' ? Building2 : item.itemType === 'professional' ? UserRound : item.itemType === 'event' ? CalendarDays : Users
  return <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 via-muted to-secondary/20 sm:h-32 sm:w-32">{item.image_url ? <img className="h-full w-full object-cover" alt={item.title} src={item.image_url} /> : <div className="flex h-full items-center justify-center"><Icon className="h-10 w-10 text-primary/35" /></div>}</div>
}

export default async function PesquisaPage({ searchParams: searchParamsPromise }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient()
  const searchParams = searchParamsPromise ? await searchParamsPromise : {}
  const categoryParam = typeof searchParams.category === 'string' ? searchParams.category.trim() : ''
  const query = typeof searchParams.q === 'string' ? searchParams.q.trim() : ''
  const locationParam = typeof searchParams.location === 'string' ? searchParams.location.trim() : ''
  const rawType = (typeof searchParams.type === 'string' ? searchParams.type : typeof searchParams.tipo === 'string' ? searchParams.tipo : 'todos').toLowerCase()
  const typeParam = typeAliases[rawType] || rawType
  const ratingParam = typeof searchParams.rating === 'string' ? Number(searchParams.rating) : null
  const sortParam = typeof searchParams.sort === 'string' ? searchParams.sort : 'relevance'
  const includeAll = typeParam === 'todos'
  let results: UnifiedResultItem[] = []

  const { data: categoriesData } = await supabase.from('categories').select('id,name,slug').order('name')
  const categories = categoriesData || []
  const selectedCategory = categoryParam ? categories.find((cat: any) => cat.slug === categoryParam || cat.name.toLowerCase() === categoryParam.toLowerCase()) : null

  let professionalIdsForCategory: string[] | null = null
  let spaceIdsForCategory: string[] | null = null
  if (selectedCategory) {
    const [{ data: professionalCategoryRows }, { data: spaceCategoryRows }] = await Promise.all([
      supabase.from('professional_categories').select('professional_id').eq('category_id', selectedCategory.id),
      supabase.from('space_categories').select('space_id').eq('category_id', selectedCategory.id),
    ])
    professionalIdsForCategory = (professionalCategoryRows || []).map((row: any) => row.professional_id)
    spaceIdsForCategory = (spaceCategoryRows || []).map((row: any) => row.space_id)
  }

  if (includeAll || typeParam === 'espacos') {
    let db = supabase.from('sport_spaces').select('id,name,slug,address,description,rating_avg,review_count,is_verified,gallery_urls,cover_url,created_at,latitude,longitude').eq('is_verified', true)
    if (query) db = db.or(`name.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`)
    if (locationParam) db = db.ilike('address', `%${locationParam}%`)
    if (ratingParam) db = db.gte('rating_avg', ratingParam)
    if (selectedCategory) db = spaceIdsForCategory?.length ? db.in('id', spaceIdsForCategory) : db.eq('id', '00000000-0000-0000-0000-000000000000')
    const { data } = await db.limit(30)
    results.push(...(data || []).map((space: any) => ({ id: `space-${space.id}`, itemType: 'space' as const, title: space.name, subtitle: space.description || 'Espaço desportivo', address: space.address || '', rating_avg: space.rating_avg, review_count: space.review_count, is_verified: true, image_url: space.cover_url || space.gallery_urls?.[0] || null, link: `/espacos/${space.slug || space.id}`, created_at: space.created_at, latitude: space.latitude, longitude: space.longitude })))
  }

  if (includeAll || typeParam === 'profissionais') {
    let db = supabase.from('professionals').select('id,full_name,professional_name,public_slug,address,location,bio,rating_avg,review_count,is_verified,avatar_url,created_at,latitude,longitude,status').eq('is_verified', true).eq('status', 'active')
    if (query) db = db.or(`full_name.ilike.%${query}%,professional_name.ilike.%${query}%,address.ilike.%${query}%,location.ilike.%${query}%,bio.ilike.%${query}%`)
    if (locationParam) db = db.or(`address.ilike.%${locationParam}%,location.ilike.%${locationParam}%`)
    if (ratingParam) db = db.gte('rating_avg', ratingParam)
    if (selectedCategory) db = professionalIdsForCategory?.length ? db.in('id', professionalIdsForCategory) : db.eq('id', '00000000-0000-0000-0000-000000000000')
    const { data } = await db.limit(30)
    results.push(...(data || []).map((prof: any) => ({ id: `pro-${prof.id}`, itemType: 'professional' as const, title: prof.professional_name || prof.full_name || 'Profissional', subtitle: prof.bio || prof.full_name || 'Profissional de desporto', address: prof.location || prof.address || '', rating_avg: prof.rating_avg, review_count: prof.review_count, is_verified: true, image_url: prof.avatar_url || null, link: `/profissionais/${prof.public_slug || prof.id}`, created_at: prof.created_at, latitude: prof.latitude, longitude: prof.longitude })))
  }

  if (includeAll || typeParam === 'eventos') {
    let db = supabase.from('events').select('id,title,address,description,image_url,created_at,start_date,latitude,longitude,status,category_id').eq('status', 'published')
    if (query) db = db.or(`title.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`)
    if (locationParam) db = db.ilike('address', `%${locationParam}%`)
    if (selectedCategory) db = db.eq('category_id', selectedCategory.id)
    const { data } = await db.limit(30)
    results.push(...(data || []).map((event: any) => ({ id: `event-${event.id}`, itemType: 'event' as const, title: event.title, subtitle: event.description || 'Evento desportivo', address: event.address || '', rating_avg: null, review_count: null, is_verified: false, image_url: event.image_url || null, link: `/eventos/${event.id}`, created_at: event.created_at, start_date: event.start_date, latitude: event.latitude, longitude: event.longitude })))
  }

  if (includeAll || typeParam === 'comunidades') {
    let db = supabase.from('communities').select('id,name,slug,description,sport_category,cover_url,is_private,created_at')
    if (query) db = db.or(`name.ilike.%${query}%,description.ilike.%${query}%,sport_category.ilike.%${query}%`)
    if (selectedCategory) db = db.or(`sport_category.ilike.%${selectedCategory.name}%,sport_category.ilike.%${selectedCategory.slug}%`)
    const { data } = await db.limit(30)
    results.push(...(data || []).map((community: any) => ({ id: `community-${community.id}`, itemType: 'community' as const, title: community.name, subtitle: community.description || community.sport_category || 'Comunidade desportiva', address: community.sport_category || '', rating_avg: null, review_count: null, is_verified: false, image_url: community.cover_url || null, link: `/comunidades/${community.slug || community.id}`, created_at: community.created_at, latitude: null, longitude: null })))
  }

  if (sortParam === 'rating') results.sort((a, b) => Number(b.rating_avg || 0) - Number(a.rating_avg || 0))
  else if (sortParam === 'newest') results.sort((a, b) => new Date(b.start_date || b.created_at || 0).getTime() - new Date(a.start_date || a.created_at || 0).getTime())
  else if (query) {
    const normalized = query.toLowerCase()
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === normalized ? 3 : a.title.toLowerCase().startsWith(normalized) ? 2 : a.title.toLowerCase().includes(normalized) ? 1 : 0
      const bExact = b.title.toLowerCase() === normalized ? 3 : b.title.toLowerCase().startsWith(normalized) ? 2 : b.title.toLowerCase().includes(normalized) ? 1 : 0
      return bExact - aExact
    })
  }

  const mapItems = results.filter(item => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)))
  const typeLabel = (item: UnifiedResultItem) => item.itemType === 'space' ? 'Espaço' : item.itemType === 'professional' ? 'Profissional' : item.itemType === 'event' ? 'Evento' : 'Comunidade'

  return (
    <PesquisaLayout
      resultsPane={<>
        <PesquisaFiltros initialQuery={query} totalResults={results.length} initialSort={sortParam} categories={categories as any[]} />
        <div className="flex-1 space-y-3 overflow-y-auto bg-muted/10 p-3 sm:p-4">
          {results.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"><Search className="h-6 w-6" /></div><h2 className="text-lg font-semibold">Nenhum resultado encontrado</h2><p className="mt-2 max-w-sm text-sm text-muted-foreground">A combinação de pesquisa e filtros não devolveu resultados. Reduz os filtros ou experimenta outra modalidade/localização.</p>{(query || categoryParam || locationParam || typeParam !== 'todos' || ratingParam) && <Link href="/pesquisa" className="mt-5 font-medium text-primary hover:underline">Limpar pesquisa</Link>}</div> : results.map(item => <Link href={item.link} key={item.id} className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-sm sm:flex-row sm:p-4"><ResultImage item={item} /><div className="flex min-w-0 flex-1 flex-col"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="mb-1 flex flex-wrap gap-1.5"><Badge variant="outline" className="text-[10px]">{typeLabel(item)}</Badge>{item.is_verified && <Badge variant="success" className="text-[10px]">Verificado</Badge>}</div><h2 className="line-clamp-1 font-semibold group-hover:text-primary">{item.title}</h2></div>{item.rating_avg !== null && Number(item.review_count || 0) > 0 && <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-700"><Star className="h-3 w-3 fill-amber-500 text-amber-500" />{Number(item.rating_avg).toFixed(1)}</span>}</div><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.subtitle}</p>{item.address && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /><span className="truncate">{item.address}</span></p>}<div className="mt-auto flex items-center justify-end pt-3 text-xs font-semibold text-primary">Ver detalhe <ArrowRight className="ml-1 h-3.5 w-3.5" /></div></div></Link>)}
        </div>
      </>}
      mapPane={<PesquisaMapWrapper items={mapItems} />}
    />
  )
}
