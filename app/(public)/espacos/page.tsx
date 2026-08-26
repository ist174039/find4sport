import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/search-bar'
import { SpaceGrid } from '@/components/space-card'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import { DiscoveryTaxonomyFilter } from '@/components/discovery-taxonomy-filter'
import { DiscoveryPagination } from '@/components/patterns/discovery-pagination'
import { parseGeoCookie } from '@/lib/geo'
import type { Category, SportSpace } from '@/lib/types'

interface PageProps { searchParams: Promise<{ category?: string; q?: string; location?: string; sort?: string; radius?: string; rating?: string; priceMin?: string; priceMax?: string; page?: string }> }
type DiscoverSpace = SportSpace & { categories: Category[]; distanceKm?: number | null; averagePrice?: number | null }
type DiscoverSpaceRow = { item: DiscoverSpace; total_count: number | string }
type RpcResult = { data: unknown; error: { message: string } | null }
type RpcCall = (name: string, args: Record<string, unknown>) => PromiseLike<RpcResult>

const PAGE_SIZE = 24
function branchIds(categories: Category[], selectedId: string) { const ids = new Set<string>([selectedId]); let changed = true; while (changed) { changed = false; for (const category of categories) if (category.parent_id && ids.has(category.parent_id) && !ids.has(category.id)) { ids.add(category.id); changed = true } } return [...ids] }
function buildHref(base: string, filters: Record<string, string | undefined>, updates: Record<string, string | undefined | null>) { const params = new URLSearchParams(); Object.entries({ ...filters, ...updates }).forEach(([key, value]) => { if (!value || (key === 'sort' && value === 'relevance') || (key === 'page' && value === '1')) return; params.set(key, value) }); return params.size ? `${base}?${params}` : base }

export default async function EspacosPage({ searchParams }: PageProps) {
  const filters = await searchParams
  const admin = await createClient()
  const cookieStore = await cookies()
  const loc = parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const { data: categoryRows, error } = await admin.from('categories').select('id,name,slug,parent_id,icon_key,taxonomy_type,is_active').eq('taxonomy_type', 'modality').eq('is_active', true).order('name')
  if (error) throw new Error('Não foi possível carregar as modalidades.')
  const categories = (categoryRows || []) as Category[]
  const selected = filters.category ? categories.find(category => category.slug === filters.category || category.id === filters.category) : undefined
  const categoryIds = selected ? branchIds(categories, selected.id) : null
  const page = Math.max(1, Number.parseInt(filters.page || '1', 10) || 1)
  const sort = filters.sort || 'relevance'
  const num = (value?: string) => { const parsed = Number(value); return Number.isFinite(parsed) && parsed > 0 ? parsed : null }
  const rpc = admin.rpc.bind(admin) as unknown as RpcCall
  const { data, error: rpcError } = await rpc('discover_spaces', { p_lat: loc?.latitude ?? null, p_lng: loc?.longitude ?? null, p_radius: num(filters.radius), p_category_ids: categoryIds, p_q: filters.q || null, p_location: filters.location || null, p_rating: num(filters.rating), p_price_min: num(filters.priceMin), p_price_max: num(filters.priceMax), p_sort: sort, p_offset: (page - 1) * PAGE_SIZE, p_limit: PAGE_SIZE })
  if (rpcError) throw new Error(`Não foi possível carregar espaços: ${rpcError.message}`)
  const rows = (data || []) as DiscoverSpaceRow[]
  const spaces = rows.map(row => row.item)
  const total = Number(rows[0]?.total_count || 0)
  const record = filters as Record<string, string | undefined>
  const sorts = [...(loc ? [{ label: 'Mais próximos', href: buildHref('/espacos', record, { sort: 'distance', page: null }), active: sort === 'distance' || sort === 'relevance' }] : [{ label: 'Relevância', href: buildHref('/espacos', record, { sort: 'relevance', page: null }), active: sort === 'relevance' }]), { label: 'Melhor avaliados', href: buildHref('/espacos', record, { sort: 'rating', page: null }), active: sort === 'rating' }, { label: 'Preço mais baixo', href: buildHref('/espacos', record, { sort: 'price_asc', page: null }), active: sort === 'price_asc' }, { label: 'Mais recentes', href: buildHref('/espacos', record, { sort: 'newest', page: null }), active: sort === 'newest' }]
  return <DiscoveryPage title={selected ? `Espaços de ${selected.name}` : 'Espaços Desportivos'} description="Encontra espaços ativos por modalidade, proximidade, preço médio e reputação." countLabel={`${total} ${total === 1 ? 'espaço encontrado' : 'espaços encontrados'}`} search={<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]"><SearchBar defaultQuery={filters.q} defaultLocation={filters.location} defaultType="espacos" showType={false} basePath="/espacos" showFilters filterType="espacos" currentFilters={filters as Record<string, string>} placeholder="Pesquisar espaços…" /><DiscoveryTaxonomyFilter basePath="/espacos" categories={categories} currentCategory={filters.category} query={filters.q} location={filters.location} sort={filters.sort} /></div>} sorts={sorts} clearHref={filters.q || filters.location || filters.category || filters.radius || filters.priceMin || filters.priceMax || sort !== 'relevance' ? '/espacos' : undefined}>{spaces.length ? <><SpaceGrid spaces={spaces} columns={4} /><DiscoveryPagination page={page} pageSize={PAGE_SIZE} total={total} href={nextPage => buildHref('/espacos', record, { page: String(nextPage) })} /></> : <DiscoveryEmptyState title="Nenhum espaço encontrado" description="Experimenta outra modalidade, localização ou raio." clearHref="/espacos" />}</DiscoveryPage>
}

export const metadata = { title: 'Espaços Desportivos', description: 'Encontre ginásios, campos, piscinas e outros espaços desportivos em Portugal.' }
