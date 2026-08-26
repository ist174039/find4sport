import Link from 'next/link'
import { Globe, Lock, MapPin, Navigation, Plus, Users } from 'lucide-react'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import { DiscoveryPagination } from '@/components/patterns/discovery-pagination'
import { SearchBar } from '@/components/search-bar'
import { Button } from '@/components/ui/button'
import { AppImage } from '@/components/ui/app-image'
import { parseGeoCookie } from '@/lib/geo'
import type { Category } from '@/lib/types'

const PAGE_SIZE = 24

type DiscoverCommunity = {
  id: string
  slug: string | null
  name: string
  description: string | null
  cover_url: string | null
  address: string | null
  distanceKm: number | null
  categories?: Array<{ name: string | null }>
  sport_category?: string | null
  memberCount?: number | null
  location_scope: string | null
  is_private: boolean | null
}

type DiscoverCommunityRow = { item: DiscoverCommunity; total_count: number | string }
type RpcResult = { data: unknown; error: { message: string } | null }
type RpcCall = (name: string, args: Record<string, unknown>) => PromiseLike<RpcResult>

function branchIds(categories: Category[], selectedId: string) {
  const ids = new Set<string>([selectedId])
  let changed = true
  while (changed) {
    changed = false
    for (const category of categories) {
      if (category.parent_id && ids.has(category.parent_id) && !ids.has(category.id)) { ids.add(category.id); changed = true }
    }
  }
  return [...ids]
}

function href(filters: Record<string, string | undefined>, updates: Record<string, string | undefined | null>) {
  const params = new URLSearchParams()
  Object.entries({ ...filters, ...updates }).forEach(([key, value]) => {
    if (!value || (key === 'sort' && value === 'newest') || (key === 'page' && value === '1')) return
    params.set(key, value)
  })
  return params.size ? `/comunidades?${params}` : '/comunidades'
}

const scopeLabel: Record<string, string> = { online: 'Online', local: 'Local', regional: 'Regional', national: 'Nacional' }

export default async function CommunitiesPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string; sort?: string; page?: string }> }) {
  const admin = await createClient()
  const cookieStore = await cookies()
  const userLocation = parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const filters = await searchParams
  const sort = filters.sort || 'newest'
  const page = Math.max(1, Number.parseInt(filters.page || '1', 10) || 1)

  const [{ data: categoryRows }, { data: categoryLinks }] = await Promise.all([
    admin.from('categories').select('id,name,slug,parent_id,icon_key,taxonomy_type,is_active').eq('taxonomy_type', 'modality').eq('is_active', true).order('name'),
    admin.from('community_categories').select('category_id'),
  ])
  const categories = (categoryRows || []) as Category[]
  const selected = filters.category ? categories.find(category => category.slug === filters.category || category.id === filters.category) : undefined
  const categoryIds = selected ? branchIds(categories, selected.id) : null

  const rpc = admin.rpc.bind(admin) as unknown as RpcCall
  const { data, error } = await rpc('discover_communities', {
    p_lat: userLocation?.latitude ?? null,
    p_lng: userLocation?.longitude ?? null,
    p_category_ids: categoryIds,
    p_q: filters.q || null,
    p_sort: sort,
    p_offset: (page - 1) * PAGE_SIZE,
    p_limit: PAGE_SIZE,
  })
  if (error) throw new Error(`Não foi possível carregar comunidades: ${error.message}`)

  const rows = (data || []) as DiscoverCommunityRow[]
  const communities = rows.map(row => row.item)
  const total = Number(rows[0]?.total_count || 0)
  const counts = new Map<string, number>()
  for (const link of categoryLinks || []) counts.set(link.category_id, (counts.get(link.category_id) || 0) + 1)
  const topCategories = categories.filter(category => counts.has(category.id)).sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0)).slice(0, 10)
  const record = filters as Record<string, string | undefined>

  return (
    <DiscoveryPage
      title="Comunidades"
      description="Junta-te a grupos desportivos online ou com localização própria."
      countLabel={`${total} ${total === 1 ? 'comunidade encontrada' : 'comunidades encontradas'}`}
      search={<SearchBar defaultQuery={filters.q} defaultType="all" showType={false} showLocation={false} basePath="/comunidades" currentFilters={{ category: filters.category }} placeholder="Pesquisar comunidades…" />}
      action={<Button asChild className="min-h-11 w-full sm:w-auto"><Link href="/comunidades/criar"><Plus className="mr-2 h-4 w-4" />Criar comunidade</Link></Button>}
      categories={[{ label: 'Todas', href: href(record, { category: null, page: null }), active: !selected }, ...topCategories.map(category => ({ label: category.name, href: href(record, { category: category.slug || category.id, page: null }), active: selected?.id === category.id }))]}
      sorts={[{ label: 'Recentes', href: href(record, { sort: 'newest', page: null }), active: sort === 'newest' }, ...(userLocation ? [{ label: 'Mais próximas', href: href(record, { sort: 'distance', page: null }), active: sort === 'distance' }] : []), { label: 'Mais membros', href: href(record, { sort: 'members', page: null }), active: sort === 'members' }, { label: 'A–Z', href: href(record, { sort: 'name', page: null }), active: sort === 'name' }]}
      clearHref={filters.q || filters.category || sort !== 'newest' ? '/comunidades' : undefined}
    >
      {communities.length ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {communities.map(community => {
              const distance = community.distanceKm == null ? null : community.distanceKm < 1 ? `${Math.round(community.distanceKm * 1000)} m` : `${Number(community.distanceKm).toFixed(1)} km`
              const primaryCategory = community.categories?.[0]?.name || community.sport_category || 'Desporto'
              return (
                <Link key={community.id} href={`/comunidades/${community.slug || community.id}`} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <AppImage src={community.cover_url || '/placeholder.jpg'} fallbackSrc="/placeholder.jpg" alt={community.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
                    <span className="absolute left-2 top-2 max-w-[70%] truncate rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-white">{primaryCategory}</span>
                    {distance && <span className="absolute bottom-2 right-2 rounded-full bg-background/95 px-2 py-1 text-[10px] font-semibold shadow"><Navigation className="mr-1 inline h-3 w-3 text-primary" />{distance}</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="line-clamp-1 text-base font-bold group-hover:text-primary">{community.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{community.description || 'Comunidade desportiva na Find4Sport.'}</p>
                    {community.address && <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{community.address}</span></p>}
                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{community.memberCount || 0}</span>
                      <span>{scopeLabel[community.location_scope || ''] || 'Online'}</span>
                      <span className="flex items-center gap-1">{community.is_private ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}{community.is_private ? 'Privada' : 'Pública'}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          <DiscoveryPagination page={page} pageSize={PAGE_SIZE} total={total} href={nextPage => href(record, { page: String(nextPage) })} />
        </>
      ) : <DiscoveryEmptyState title="Nenhuma comunidade encontrada" description="Experimenta remover filtros ou cria uma nova comunidade." clearHref="/comunidades" />}
    </DiscoveryPage>
  )
}
