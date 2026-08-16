import { ArrowRight, Building2, CalendarDays, MapPin, Search, Star, UserRound, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { PesquisaFiltros } from '@/components/pesquisa-filtros'
import { PesquisaMapWrapper } from '@/components/pesquisa-map-wrapper'
import { PesquisaLayout } from '@/components/pesquisa-layout'
import { Badge } from '@/components/ui/badge'
import type { TaxonomyOption } from '@/components/taxonomy-combobox'
import { parseSearchFilters } from '@/lib/search/filters'
import { distanceFrom, parseGeoCookie } from '@/lib/geo'

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
  distanceKm?: number | null
}

type CategoryRow = TaxonomyOption

function ResultImage({ item }: { item: UnifiedResultItem }) {
  const Icon = item.itemType === 'space' ? Building2 : item.itemType === 'professional' ? UserRound : item.itemType === 'event' ? CalendarDays : Users
  return <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 via-muted to-secondary/20 sm:h-32 sm:w-32">{item.image_url ? <img className="h-full w-full object-cover" alt={item.title} src={item.image_url} /> : <div className="flex h-full items-center justify-center"><Icon className="h-10 w-10 text-primary/35" /></div>}</div>
}

function categoryBranchIds(categories: CategoryRow[], selectedId: string) {
  const ids = new Set<string>([selectedId])
  let changed = true
  while (changed) {
    changed = false
    for (const category of categories) if (category.parent_id && ids.has(category.parent_id) && !ids.has(category.id)) { ids.add(category.id); changed = true }
  }
  return [...ids]
}

function rankText(item: UnifiedResultItem, query: string) {
  if (!query) return 0
  const title = item.title.toLowerCase()
  const normalized = query.toLowerCase()
  return title === normalized ? 3 : title.startsWith(normalized) ? 2 : title.includes(normalized) ? 1 : 0
}

export default async function PesquisaPage({ searchParams: searchParamsPromise }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userLocation = parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const searchParams = searchParamsPromise ? await searchParamsPromise : {}
  const { category: categoryParam, query, location: locationParam, type: typeParam, rating: ratingParam, sort: sortParam } = parseSearchFilters(searchParams)
  const includeAll = typeParam === 'todos'
  let results: UnifiedResultItem[] = []

  const { data: rawCategories } = await supabase.from('categories').select('*').order('name')
  const categories: CategoryRow[] = (rawCategories || []).map(row => { const candidate = row as unknown as Record<string, unknown>; return { id: String(candidate.id), name: String(candidate.name || ''), slug: String(candidate.slug || ''), emoji: typeof candidate.emoji === 'string' ? candidate.emoji : null, parent_id: typeof candidate.parent_id === 'string' ? candidate.parent_id : null } })
  const selectedCategory = categoryParam ? categories.find(category => category.slug === categoryParam || category.id === categoryParam || category.name.toLowerCase() === categoryParam.toLowerCase()) : null
  const categoryIds = selectedCategory ? categoryBranchIds(categories, selectedCategory.id) : []
  const categoryNames = selectedCategory ? categories.filter(category => categoryIds.includes(category.id)).flatMap(category => [category.name, category.slug]).filter(Boolean) : []

  let professionalIdsForCategory: string[] | null = null
  let spaceIdsForCategory: string[] | null = null
  if (selectedCategory) {
    const [{ data: professionalCategoryRows }, { data: spaceCategoryRows }] = await Promise.all([
      supabase.from('professional_categories').select('professional_id').in('category_id', categoryIds),
      supabase.from('space_categories').select('space_id').in('category_id', categoryIds),
    ])
    professionalIdsForCategory = (professionalCategoryRows || []).map(row => row.professional_id)
    spaceIdsForCategory = (spaceCategoryRows || []).map(row => row.space_id)
  }

  if (includeAll || typeParam === 'espacos') {
    let db = supabase.from('sport_spaces').select('id,name,slug,address,description,rating_avg,review_count,is_verified,gallery_urls,cover_url,created_at,latitude,longitude,status').or('status.eq.active,is_verified.eq.true')
    if (query) db = db.or(`name.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`)
    if (locationParam) db = db.ilike('address', `%${locationParam}%`)
    if (ratingParam) db = db.gte('rating_avg', ratingParam)
    if (selectedCategory) db = spaceIdsForCategory?.length ? db.in('id', spaceIdsForCategory) : db.eq('id', '00000000-0000-0000-0000-000000000000')
    const { data, error } = await db.limit(40)
    if (error) console.error('Search spaces error:', error)
    results.push(...(data || []).map(space => ({ id: `space-${space.id}`, itemType: 'space' as const, title: space.name, subtitle: space.description || 'Espaço desportivo', address: space.address || '', rating_avg: space.rating_avg, review_count: space.review_count, is_verified: Boolean(space.is_verified), image_url: space.cover_url || space.gallery_urls?.[0] || null, link: `/espacos/${space.slug || space.id}`, created_at: space.created_at, latitude: space.latitude, longitude: space.longitude, distanceKm: distanceFrom(userLocation, space.latitude, space.longitude) })))
  }

  if (includeAll || typeParam === 'profissionais') {
    let db = supabase.from('professionals').select('id,full_name,professional_name,public_slug,address,bio,rating_avg,review_count,is_verified,avatar_url,created_at,latitude,longitude,status').eq('status', 'active')
    if (query) db = db.or(`full_name.ilike.%${query}%,professional_name.ilike.%${query}%,address.ilike.%${query}%,bio.ilike.%${query}%`)
    if (locationParam) db = db.ilike('address', `%${locationParam}%`)
    if (ratingParam) db = db.gte('rating_avg', ratingParam)
    if (selectedCategory) db = professionalIdsForCategory?.length ? db.in('id', professionalIdsForCategory) : db.eq('id', '00000000-0000-0000-0000-000000000000')
    const { data, error } = await db.limit(40)
    if (error) console.error('Search professionals error:', error)
    results.push(...(data || []).map(prof => ({ id: `pro-${prof.id}`, itemType: 'professional' as const, title: prof.professional_name || prof.full_name || 'Profissional', subtitle: prof.bio || prof.full_name || 'Profissional de desporto', address: prof.address || '', rating_avg: prof.rating_avg, review_count: prof.review_count, is_verified: Boolean(prof.is_verified), image_url: prof.avatar_url || null, link: `/profissionais/${prof.public_slug || prof.id}`, created_at: prof.created_at, latitude: prof.latitude, longitude: prof.longitude, distanceKm: distanceFrom(userLocation, prof.latitude, prof.longitude) })))
  }

  if (includeAll || typeParam === 'eventos') {
    let db = supabase.from('events').select('id,title,address,description,image_url,created_at,start_date,latitude,longitude,status,category_id').eq('status', 'published')
    if (query) db = db.or(`title.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`)
    if (locationParam) db = db.ilike('address', `%${locationParam}%`)
    if (selectedCategory) db = db.in('category_id', categoryIds)
    const { data, error } = await db.limit(40)
    if (error) console.error('Search events error:', error)
    results.push(...(data || []).map(event => ({ id: `event-${event.id}`, itemType: 'event' as const, title: event.title, subtitle: event.description || 'Evento desportivo', address: event.address || '', rating_avg: null, review_count: null, is_verified: false, image_url: event.image_url || null, link: `/eventos/${event.id}`, created_at: event.created_at, start_date: event.start_date, latitude: event.latitude, longitude: event.longitude, distanceKm: distanceFrom(userLocation, event.latitude, event.longitude) })))
  }

  if (includeAll || typeParam === 'comunidades') {
    let db = supabase.from('communities').select('id,name,slug,description,sport_category,cover_url,is_private,created_at')
    if (query) db = db.or(`name.ilike.%${query}%,description.ilike.%${query}%,sport_category.ilike.%${query}%`)
    if (selectedCategory && categoryNames.length) db = db.or(categoryNames.map(value => `sport_category.ilike.%${value}%`).join(','))
    const { data, error } = await db.limit(40)
    if (error) console.error('Search communities error:', error)
    results.push(...(data || []).map(community => ({ id: `community-${community.id}`, itemType: 'community' as const, title: community.name, subtitle: community.description || community.sport_category || 'Comunidade desportiva', address: community.sport_category || '', rating_avg: null, review_count: null, is_verified: false, image_url: community.cover_url || null, link: `/comunidades/${community.slug || community.id}`, created_at: community.created_at, latitude: null, longitude: null, distanceKm: null })))
  }

  if (sortParam === 'rating') results.sort((a, b) => Number(b.rating_avg || 0) - Number(a.rating_avg || 0))
  else if (sortParam === 'newest') results.sort((a, b) => new Date(b.start_date || b.created_at || 0).getTime() - new Date(a.start_date || a.created_at || 0).getTime())
  else results.sort((a, b) => {
    const textDiff = rankText(b, query) - rankText(a, query)
    if (textDiff) return textDiff
    if (userLocation) {
      const aDistance = a.distanceKm ?? Number.POSITIVE_INFINITY
      const bDistance = b.distanceKm ?? Number.POSITIVE_INFINITY
      if (aDistance !== bDistance) return aDistance - bDistance
    }
    return Number(b.rating_avg || 0) - Number(a.rating_avg || 0)
  })

  const mapItems = results.filter(item => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)))
  const typeLabel = (item: UnifiedResultItem) => item.itemType === 'space' ? 'Espaço' : item.itemType === 'professional' ? 'Profissional' : item.itemType === 'event' ? 'Evento' : 'Comunidade'

  return <PesquisaLayout resultsPane={<><PesquisaFiltros initialQuery={query} totalResults={results.length} initialSort={sortParam} categories={categories} /><div className="flex-1 space-y-3 overflow-y-auto bg-muted/10 p-3 sm:p-4">{results.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"><Search className="h-6 w-6" /></div><h2 className="text-lg font-semibold">Nenhum resultado encontrado</h2><p className="mt-2 max-w-sm text-sm text-muted-foreground">A combinação de pesquisa e filtros não devolveu resultados. Reduz os filtros ou experimenta outra modalidade/localização.</p>{(query || categoryParam || locationParam || typeParam !== 'todos' || ratingParam) && <Link href="/pesquisa" className="mt-5 font-medium text-primary hover:underline">Limpar pesquisa</Link>}</div> : results.map(item => <Link href={item.link} key={item.id} className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-sm sm:flex-row sm:p-4"><ResultImage item={item} /><div className="flex min-w-0 flex-1 flex-col"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="mb-1 flex flex-wrap gap-1.5"><Badge variant="outline" className="text-[10px]">{typeLabel(item)}</Badge>{item.is_verified && <Badge variant="success" className="text-[10px]">Verificado</Badge>}</div><h2 className="line-clamp-1 font-semibold group-hover:text-primary">{item.title}</h2></div>{item.rating_avg !== null && Number(item.review_count || 0) > 0 && <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-700"><Star className="h-3 w-3 fill-amber-500 text-amber-500" />{Number(item.rating_avg).toFixed(1)}</span>}</div><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.subtitle}</p>{item.address && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /><span className="truncate">{item.address}</span></p>}{item.distanceKm != null && <p className="mt-1 text-xs font-medium text-primary">{item.distanceKm < 1 ? `${Math.round(item.distanceKm * 1000)} m` : `${item.distanceKm.toFixed(1)} km`} de ti</p>}<div className="mt-auto flex items-center justify-end pt-3 text-xs font-semibold text-primary">Ver detalhe <ArrowRight className="ml-1 h-3.5 w-3.5" /></div></div></Link>)}</div></>} mapPane={<PesquisaMapWrapper items={mapItems} userLocation={userLocation} />} />
}
