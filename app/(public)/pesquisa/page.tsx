import type { Metadata } from 'next'
import { Search } from 'lucide-react'
import { cookies } from 'next/headers'
import { PesquisaFiltros } from '@/components/pesquisa-filtros'
import { PesquisaMapWrapper } from '@/components/pesquisa-map-wrapper'
import { PesquisaLayout } from '@/components/pesquisa-layout'
import { SearchResultsList } from '@/components/search-results-list'
import { DiscoveryPagination } from '@/components/patterns/discovery-pagination'
import type { TaxonomyOption } from '@/components/taxonomy-combobox'
import { parseSearchFilters } from '@/lib/search/filters'
import { parseGeoCookie } from '@/lib/geo'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
const PAGE_SIZE = 24

export const metadata: Metadata = {
  title: 'Pesquisa',
  description: 'Pesquise profissionais, espaços, eventos e comunidades desportivas.',
  alternates: { canonical: '/pesquisa' },
  robots: { index: false, follow: true },
}

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
  averagePrice?: number | null
  price_min?: number | null
  memberCount?: number | null
}

type SearchRow = { item: UnifiedResultItem; total_count: number | string }
type RpcResult = { data: unknown; error: { message: string } | null }

function branchIds(categories: TaxonomyOption[], selectedId: string) {
  const ids = new Set<string>([selectedId])
  let changed = true
  while (changed) {
    changed = false
    for (const category of categories) {
      if (category.parent_id && ids.has(category.parent_id) && !ids.has(category.id)) {
        ids.add(category.id)
        changed = true
      }
    }
  }
  return [...ids]
}

function pageHref(searchParams: Record<string, string | string[] | undefined>, page: number) {
  const params = new URLSearchParams()
  for (const [key, rawValue] of Object.entries(searchParams)) {
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue
    if (value && key !== 'page') params.set(key, value)
  }
  if (page > 1) params.set('page', String(page))
  return params.size ? `/pesquisa?${params}` : '/pesquisa'
}

export default async function PesquisaPage({ searchParams: promise }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userLocation = parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const searchParams = promise ? await promise : {}
  const filters = parseSearchFilters(searchParams)
  const pageRaw = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page
  const page = Math.max(1, Number.parseInt(pageRaw || '1', 10) || 1)

  const { data: rawCategories, error: categoryError } = await supabase
    .from('categories')
    .select('id,name,slug,parent_id')
    .eq('taxonomy_type', 'modality')
    .eq('is_active', true)
    .order('name')
  if (categoryError) throw new Error('Não foi possível carregar as modalidades.')

  const categories: TaxonomyOption[] = (rawCategories || []).map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    emoji: null,
    parent_id: row.parent_id,
  }))
  const selectedCategory = filters.category
    ? categories.find(category => category.slug === filters.category || category.id === filters.category || category.name.toLowerCase() === filters.category.toLowerCase())
    : null
  const categoryIds = selectedCategory ? branchIds(categories, selectedCategory.id) : null
  const dateFrom = filters.dateFrom ? `${filters.dateFrom}T00:00:00+00:00` : null
  const dateTo = filters.dateTo ? `${filters.dateTo}T23:59:59+00:00` : null

  const rpc = supabase.rpc.bind(supabase) as unknown as (name: string, args: Record<string, unknown>) => PromiseLike<RpcResult>
  const { data, error } = await rpc('search_public_entities', {
    p_q: filters.query || null,
    p_entity_type: filters.type,
    p_category_ids: categoryIds,
    p_location: filters.location || null,
    p_rating: filters.rating,
    p_lat: userLocation?.latitude ?? null,
    p_lng: userLocation?.longitude ?? null,
    p_radius: filters.radius,
    p_date_from: dateFrom,
    p_date_to: dateTo,
    p_sort: filters.sort,
    p_offset: (page - 1) * PAGE_SIZE,
    p_limit: PAGE_SIZE,
  })
  if (error) throw new Error(`Não foi possível executar a pesquisa: ${error.message}`)

  const rows = (Array.isArray(data) ? data : []) as SearchRow[]
  const results = rows.map(row => row.item)
  const total = Number(rows[0]?.total_count || 0)
  const mapItems = results.filter(item => (Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))) || Boolean(item.mapAddress))

  return <PesquisaLayout
    resultsPane={<>
      <PesquisaFiltros initialQuery={filters.query} totalResults={total} initialSort={filters.sort} categories={categories} />
      <div className="flex-1 overflow-y-auto bg-muted/10 p-3 sm:p-4">
        {!results.length
          ? <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><Search className="mb-4 h-8 w-8 text-primary" /><h2 className="text-lg font-semibold">Nenhum resultado encontrado</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">Reduza os filtros, aumente o raio ou experimente outra modalidade ou localização.</p></div>
          : <><SearchResultsList items={results} /><DiscoveryPagination page={page} pageSize={PAGE_SIZE} total={total} href={nextPage => pageHref(searchParams, nextPage)} /></>}
      </div>
    </>}
    mapPane={<PesquisaMapWrapper items={mapItems} userLocation={userLocation} />}
  />
}
