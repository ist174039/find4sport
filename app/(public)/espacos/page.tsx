import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/search-bar'
import { SpaceGrid } from '@/components/space-card'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import { DiscoveryTaxonomyFilter } from '@/components/discovery-taxonomy-filter'
import type { Category, SportSpace } from '@/lib/types'

interface PageProps { searchParams: Promise<{ category?: string; q?: string; location?: string; sort?: string }> }

async function getSpacesData(searchParams: { category?: string; q?: string; location?: string; sort?: string }) {
  const supabase = await createClient()
  const { data: categoryRows, error: categoryError } = await supabase.from('categories').select('*').order('name')
  if (categoryError) throw new Error('Não foi possível carregar as modalidades.')
  const categories = (categoryRows || []) as Category[]
  const selectedCategory = searchParams.category ? categories.find(item => item.slug === searchParams.category) : undefined

  let spaceIdsForCategory: string[] | null = null
  if (selectedCategory) {
    const { data, error } = await supabase.from('space_categories').select('space_id').eq('category_id', selectedCategory.id)
    if (error) throw new Error('Não foi possível filtrar espaços por modalidade.')
    spaceIdsForCategory = (data || []).map(row => row.space_id)
  }

  let query = supabase.from('sport_spaces').select('*')
  if (searchParams.q) query = query.or(`name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  if (searchParams.location) query = query.ilike('address', `%${searchParams.location}%`)
  if (selectedCategory) query = spaceIdsForCategory?.length ? query.in('id', spaceIdsForCategory) : query.eq('id', '00000000-0000-0000-0000-000000000000')
  const { data: spaceRows, error: spacesError } = await query.limit(24)
  if (spacesError) throw new Error(`Não foi possível carregar espaços: ${spacesError.message}`)
  const spaces = spaceRows || []

  const categoriesById = new Map(categories.map(category => [category.id, category]))
  const categoryMap = new Map<string, Category[]>()
  if (spaces.length) {
    const { data: links } = await supabase.from('space_categories').select('space_id,category_id').in('space_id', spaces.map(item => item.id))
    for (const link of links || []) {
      const category = categoriesById.get(link.category_id)
      if (!category) continue
      const current = categoryMap.get(link.space_id) || []
      current.push(category)
      categoryMap.set(link.space_id, current)
    }
  }

  const transformed = spaces.map(space => ({ ...space, categories: categoryMap.get(space.id) || [] }))
  const sortBy = searchParams.sort || 'relevance'
  transformed.sort((a, b) => sortBy === 'rating' ? (b.rating_avg || 0) - (a.rating_avg || 0) : sortBy === 'reviews' ? (b.review_count || 0) - (a.review_count || 0) : sortBy === 'newest' ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : 0)
  return { categories, spaces: transformed as (SportSpace & { categories: Category[] })[], filters: searchParams }
}

function href(base: string, filters: Record<string, string | undefined>, updates: Record<string, string | undefined | null>, defaultSort = 'relevance') {
  const params = new URLSearchParams(); Object.entries({ ...filters, ...updates }).forEach(([key, value]) => { if (!value || (key === 'sort' && value === defaultSort)) return; params.set(key, value) }); const qs = params.toString(); return qs ? `${base}?${qs}` : base
}

export default async function EspacosPage({ searchParams }: PageProps) {
  const resolved = await searchParams
  const { categories, spaces, filters } = await getSpacesData(resolved)
  const selectedCategory = categories.find(c => c.slug === filters.category)
  const currentSort = filters.sort || 'relevance'
  const filterRecord = filters as Record<string, string | undefined>
  return <DiscoveryPage
    title={selectedCategory ? `Espaços de ${selectedCategory.name}` : 'Espaços Desportivos'}
    description="Encontra espaços por modalidade, localização e reputação."
    countLabel={`${spaces.length} ${spaces.length === 1 ? 'espaço encontrado' : 'espaços encontrados'}`}
    search={<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]"><SearchBar defaultQuery={filters.q} defaultLocation={filters.location} defaultType="espacos" showType={false} basePath="/espacos" showFilters filterType="espacos" currentFilters={filters as Record<string, string>} placeholder="Pesquisar espaços…" /><DiscoveryTaxonomyFilter basePath="/espacos" categories={categories} currentCategory={filters.category} query={filters.q} location={filters.location} sort={filters.sort} /></div>}
    sorts={[
      { label: 'Relevância', href: href('/espacos', filterRecord, { sort: 'relevance' }), active: currentSort === 'relevance' },
      { label: 'Melhor avaliados', href: href('/espacos', filterRecord, { sort: 'rating' }), active: currentSort === 'rating' },
      { label: 'Mais avaliados', href: href('/espacos', filterRecord, { sort: 'reviews' }), active: currentSort === 'reviews' },
      { label: 'Mais recentes', href: href('/espacos', filterRecord, { sort: 'newest' }), active: currentSort === 'newest' },
    ]}
    clearHref={filters.q || filters.location || filters.category || currentSort !== 'relevance' ? '/espacos' : undefined}
  >{spaces.length ? <SpaceGrid spaces={spaces} columns={3} /> : <DiscoveryEmptyState title="Nenhum espaço encontrado" description="Experimenta outra modalidade ou localização." clearHref="/espacos" />}</DiscoveryPage>
}

export const metadata = { title: 'Espaços Desportivos', description: 'Encontre ginásios, campos, piscinas e outros espaços desportivos em Portugal.' }
