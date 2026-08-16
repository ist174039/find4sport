import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/search-bar'
import { SpaceGrid } from '@/components/space-card'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import type { Category, SportSpace } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string; location?: string; sort?: string }>
}

async function getSpacesData(searchParams: { category?: string; q?: string; location?: string; sort?: string }) {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('space_count', { ascending: false })
  let query = supabase.from('sport_spaces').select(`*, categories:space_categories(category:categories(*))`)
  if (searchParams.q) query = query.or(`name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  if (searchParams.location) query = query.ilike('address', `%${searchParams.location}%`)
  const { data: spaces } = await query.limit(24)

  let filtered = spaces || []
  if (searchParams.category) filtered = filtered.filter((space) => space.categories?.some((c: { category: Category }) => c.category?.slug === searchParams.category))
  const transformed = filtered.map((space) => ({ ...space, categories: space.categories?.map((c: { category: Category }) => c.category).filter(Boolean) || [] }))
  const sortBy = searchParams.sort || 'relevance'
  transformed.sort((a, b) => {
    if (sortBy === 'rating') return (b.rating_avg || 0) - (a.rating_avg || 0)
    if (sortBy === 'reviews') return (b.review_count || 0) - (a.review_count || 0)
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return 0
  })
  return { categories: (categories || []) as Category[], spaces: transformed as (SportSpace & { categories: Category[] })[], filters: searchParams }
}

function href(base: string, filters: Record<string, string | undefined>, updates: Record<string, string | undefined | null>, defaultSort = 'relevance') {
  const params = new URLSearchParams()
  Object.entries({ ...filters, ...updates }).forEach(([key, value]) => {
    if (!value) return
    if (key === 'sort' && value === defaultSort) return
    params.set(key, value)
  })
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export default async function EspacosPage({ searchParams }: PageProps) {
  const resolved = await searchParams
  const { categories, spaces, filters } = await getSpacesData(resolved)
  const selectedCategory = categories.find((c) => c.slug === filters.category)
  const currentSort = filters.sort || 'relevance'
  const filterRecord = filters as Record<string, string | undefined>

  return (
    <DiscoveryPage
      title={selectedCategory ? `Espaços de ${selectedCategory.name}` : 'Espaços Desportivos'}
      description="Encontra instalações, campos e salas, compara localização, avaliações e disponibilidade."
      countLabel={`${spaces.length} ${spaces.length === 1 ? 'espaço encontrado' : 'espaços encontrados'}`}
      search={<SearchBar defaultQuery={filters.q} defaultLocation={filters.location} defaultType="espacos" showFilters filterType="espacos" currentFilters={filters as Record<string, string>} />}
      categories={[
        { label: 'Todos', href: href('/espacos', filterRecord, { category: null }), active: !filters.category },
        ...categories.slice(0, 10).map((cat) => ({ label: `${cat.emoji || ''} ${cat.name}`.trim(), href: href('/espacos', filterRecord, { category: cat.slug }), active: filters.category === cat.slug })),
      ]}
      sorts={[
        { label: 'Relevância', href: href('/espacos', filterRecord, { sort: 'relevance' }), active: currentSort === 'relevance' },
        { label: 'Melhor avaliados', href: href('/espacos', filterRecord, { sort: 'rating' }), active: currentSort === 'rating' },
        { label: 'Mais avaliados', href: href('/espacos', filterRecord, { sort: 'reviews' }), active: currentSort === 'reviews' },
        { label: 'Mais recentes', href: href('/espacos', filterRecord, { sort: 'newest' }), active: currentSort === 'newest' },
      ]}
      clearHref={filters.q || filters.location || filters.category || currentSort !== 'relevance' ? '/espacos' : undefined}
    >
      {spaces.length ? <SpaceGrid spaces={spaces} columns={3} /> : <DiscoveryEmptyState title="Nenhum espaço encontrado" description="Experimenta remover alguns filtros ou pesquisar noutra localização." clearHref="/espacos" />}
    </DiscoveryPage>
  )
}

export const metadata = {
  title: 'Espaços Desportivos',
  description: 'Encontre ginásios, campos, piscinas e outros espaços desportivos em Portugal.',
}
