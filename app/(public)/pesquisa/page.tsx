import { ArrowRight, Building2, CalendarDays, MapPin, Search, Star, UserRound, Users } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
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
  mapAddress?: string | null
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

function branchIds(categories: CategoryRow[], selectedId: string) {
  const ids = new Set<string>([selectedId]); let changed = true
  while (changed) { changed = false; for (const c of categories) if (c.parent_id && ids.has(c.parent_id) && !ids.has(c.id)) { ids.add(c.id); changed = true } }
  return [...ids]
}

function ResultImage({ item }: { item: UnifiedResultItem }) {
  const Icon = item.itemType === 'space' ? Building2 : item.itemType === 'professional' ? UserRound : item.itemType === 'event' ? CalendarDays : Users
  return <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 via-muted to-secondary/20 sm:h-32 sm:w-32">{item.image_url ? <img className="h-full w-full object-cover" alt={item.title} src={item.image_url} /> : <div className="flex h-full items-center justify-center"><Icon className="h-10 w-10 text-primary/35" /></div>}</div>
}

function textRank(item: UnifiedResultItem, query: string) {
  if (!query) return 0; const title = item.title.toLowerCase(); const q = query.toLowerCase()
  return title === q ? 3 : title.startsWith(q) ? 2 : title.includes(q) ? 1 : 0
}

export default async function PesquisaPage({ searchParams: promise }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const admin = createAdminClient()
  const cookieStore = await cookies()
  const userLocation = parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const searchParams = promise ? await promise : {}
  const { category: categoryParam, query, location: locationParam, type: typeParam, rating: ratingParam, sort: sortParam } = parseSearchFilters(searchParams)
  const includeAll = typeParam === 'todos'
  let results: UnifiedResultItem[] = []

  const { data: rawCategories } = await admin.from('categories').select('*').order('name')
  const categories: CategoryRow[] = (rawCategories || []).map(row => { const r = row as unknown as Record<string, unknown>; return { id: String(r.id), name: String(r.name || ''), slug: String(r.slug || ''), emoji: typeof r.emoji === 'string' ? r.emoji : null, parent_id: typeof r.parent_id === 'string' ? r.parent_id : null } })
  const selectedCategory = categoryParam ? categories.find(c => c.slug === categoryParam || c.id === categoryParam || c.name.toLowerCase() === categoryParam.toLowerCase()) : null
  const categoryIds = selectedCategory ? branchIds(categories, selectedCategory.id) : []
  const categoryNames = selectedCategory ? categories.filter(c => categoryIds.includes(c.id)).map(c => c.name) : []

  let professionalIds: string[] | null = null; let spaceIds: string[] | null = null
  if (selectedCategory) {
    const [p, s] = await Promise.all([admin.from('professional_categories').select('professional_id').in('category_id', categoryIds), admin.from('space_categories').select('space_id').in('category_id', categoryIds)])
    professionalIds = [...new Set((p.data || []).map(x => x.professional_id))]; spaceIds = [...new Set((s.data || []).map(x => x.space_id))]
  }

  if (includeAll || typeParam === 'profissionais') {
    let db = admin.from('professionals').select('id,full_name,professional_name,public_slug,address,bio,rating_avg,review_count,is_verified,avatar_url,created_at,latitude,longitude,status').eq('status', 'active')
    if (query) db = db.or(`full_name.ilike.%${query}%,professional_name.ilike.%${query}%,address.ilike.%${query}%,bio.ilike.%${query}%`)
    if (locationParam) db = db.ilike('address', `%${locationParam}%`)
    if (ratingParam) db = db.gte('rating_avg', ratingParam)
    if (selectedCategory) db = professionalIds?.length ? db.in('id', professionalIds) : db.eq('id', '00000000-0000-0000-0000-000000000000')
    const { data, error } = await db.limit(100); if (error) console.error('Public professional search:', error)
    results.push(...(data || []).map(p => ({ id:`pro-${p.id}`, itemType:'professional' as const, title:p.professional_name || p.full_name || 'Profissional', subtitle:p.bio || 'Profissional de desporto', address:p.address || '', mapAddress:p.address, rating_avg:p.rating_avg, review_count:p.review_count, is_verified:Boolean(p.is_verified), image_url:p.avatar_url, link:`/profissionais/${p.public_slug || p.id}`, created_at:p.created_at, latitude:p.latitude, longitude:p.longitude, distanceKm:distanceFrom(userLocation,p.latitude,p.longitude) })))
  }

  if (includeAll || typeParam === 'espacos') {
    let db = admin.from('sport_spaces').select('id,name,slug,address,description,rating_avg,review_count,is_verified,gallery_urls,cover_url,created_at,latitude,longitude,status').or('status.eq.active,is_verified.eq.true')
    if (query) db = db.or(`name.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`)
    if (locationParam) db = db.ilike('address', `%${locationParam}%`)
    if (ratingParam) db = db.gte('rating_avg', ratingParam)
    if (selectedCategory) db = spaceIds?.length ? db.in('id', spaceIds) : db.eq('id', '00000000-0000-0000-0000-000000000000')
    const { data, error } = await db.limit(100); if (error) console.error('Public space search:', error)
    results.push(...(data || []).map(s => ({ id:`space-${s.id}`, itemType:'space' as const, title:s.name, subtitle:s.description || 'Espaço desportivo', address:s.address || '', mapAddress:s.address, rating_avg:s.rating_avg, review_count:s.review_count, is_verified:Boolean(s.is_verified), image_url:s.cover_url || s.gallery_urls?.[0] || null, link:`/espacos/${s.slug || s.id}`, created_at:s.created_at, latitude:s.latitude, longitude:s.longitude, distanceKm:distanceFrom(userLocation,s.latitude,s.longitude) })))
  }

  if (includeAll || typeParam === 'eventos') {
    let db = admin.from('events').select('id,title,address,description,image_url,created_at,start_date,latitude,longitude,status,category_id').eq('status', 'published')
    if (query) db = db.or(`title.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`)
    if (locationParam) db = db.ilike('address', `%${locationParam}%`)
    if (selectedCategory) db = db.in('category_id', categoryIds)
    const { data, error } = await db.limit(100); if (error) console.error('Public event search:', error)
    results.push(...(data || []).map(e => ({ id:`event-${e.id}`, itemType:'event' as const, title:e.title, subtitle:e.description || 'Evento desportivo', address:e.address || '', mapAddress:e.address, rating_avg:null, review_count:null, is_verified:false, image_url:e.image_url, link:`/eventos/${e.id}`, created_at:e.created_at, start_date:e.start_date, latitude:e.latitude, longitude:e.longitude, distanceKm:distanceFrom(userLocation,e.latitude,e.longitude) })))
  }

  if (includeAll || typeParam === 'comunidades') {
    let db = admin.from('communities').select('id,name,slug,description,sport_category,cover_url,is_private,created_at,created_by')
    if (query) db = db.or(`name.ilike.%${query}%,description.ilike.%${query}%,sport_category.ilike.%${query}%`)
    if (selectedCategory && categoryNames.length) db = db.or(categoryNames.map(value => `sport_category.ilike.%${value}%`).join(','))
    const { data, error } = await db.limit(100); if (error) console.error('Public community search:', error)
    const communities = data || []; const creatorIds = [...new Set(communities.map(c => c.created_by).filter((x): x is string => Boolean(x)))]
    const [creatorPros, creatorSpaces] = creatorIds.length ? await Promise.all([
      admin.from('professionals').select('user_id,address,latitude,longitude').in('user_id', creatorIds),
      admin.from('sport_spaces').select('owner_user_id,address,latitude,longitude').in('owner_user_id', creatorIds),
    ]) : [{ data: [] }, { data: [] }] as any
    const refs = new Map<string,{address:string|null;latitude:number|null;longitude:number|null}>()
    for (const p of creatorPros.data || []) if (!refs.has(p.user_id)) refs.set(p.user_id,{address:p.address,latitude:p.latitude,longitude:p.longitude})
    for (const s of creatorSpaces.data || []) if (s.owner_user_id && !refs.has(s.owner_user_id)) refs.set(s.owner_user_id,{address:s.address,latitude:s.latitude,longitude:s.longitude})
    results.push(...communities.map(c => { const ref = c.created_by ? refs.get(c.created_by) : undefined; return { id:`community-${c.id}`, itemType:'community' as const, title:c.name, subtitle:c.description || c.sport_category || 'Comunidade desportiva', address:ref?.address ? `Referência: ${ref.address}` : (c.sport_category || ''), mapAddress:ref?.address || null, rating_avg:null, review_count:null, is_verified:false, image_url:c.cover_url, link:`/comunidades/${c.slug || c.id}`, created_at:c.created_at, latitude:ref?.latitude ?? null, longitude:ref?.longitude ?? null, distanceKm:distanceFrom(userLocation,ref?.latitude,ref?.longitude) } }))
  }

  if (sortParam === 'rating') results.sort((a,b)=>Number(b.rating_avg||0)-Number(a.rating_avg||0))
  else if (sortParam === 'newest') results.sort((a,b)=>new Date(b.start_date||b.created_at||0).getTime()-new Date(a.start_date||a.created_at||0).getTime())
  else results.sort((a,b)=>{ const text=textRank(b,query)-textRank(a,query); if(text)return text; if(userLocation){const da=a.distanceKm??Infinity,db=b.distanceKm??Infinity;if(da!==db)return da-db} return Number(b.rating_avg||0)-Number(a.rating_avg||0) })

  const mapItems = results.filter(item => (Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))) || Boolean(item.mapAddress))
  const label=(i:UnifiedResultItem)=>i.itemType==='space'?'Espaço':i.itemType==='professional'?'Profissional':i.itemType==='event'?'Evento':'Comunidade'
  return <PesquisaLayout resultsPane={<><PesquisaFiltros initialQuery={query} totalResults={results.length} initialSort={sortParam} categories={categories}/><div className="flex-1 space-y-3 overflow-y-auto bg-muted/10 p-3 sm:p-4">{!results.length?<div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><Search className="mb-4 h-8 w-8 text-primary"/><h2 className="text-lg font-semibold">Nenhum resultado encontrado</h2><p className="mt-2 text-sm text-muted-foreground">Reduz os filtros ou experimenta outra modalidade/localização.</p></div>:results.map(item=><Link href={item.link} key={item.id} className="group flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row sm:p-4"><ResultImage item={item}/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><Badge variant="outline" className="mb-1 text-[10px]">{label(item)}</Badge><h2 className="font-semibold group-hover:text-primary">{item.title}</h2></div>{item.rating_avg!==null&&Number(item.review_count||0)>0&&<span className="flex items-center gap-1 text-xs font-semibold"><Star className="h-3 w-3 fill-amber-500 text-amber-500"/>{Number(item.rating_avg).toFixed(1)}</span>}</div><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.subtitle}</p>{item.address&&<p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-primary"/><span className="truncate">{item.address}</span></p>}{item.distanceKm!=null&&<p className="mt-1 text-xs font-medium text-primary">{item.distanceKm<1?`${Math.round(item.distanceKm*1000)} m`:`${item.distanceKm.toFixed(1)} km`} de ti</p>}<div className="mt-3 flex justify-end text-xs font-semibold text-primary">Ver detalhe <ArrowRight className="ml-1 h-3.5 w-3.5"/></div></div></Link>)}</div></>} mapPane={<PesquisaMapWrapper items={mapItems} userLocation={userLocation}/>}/>
}
