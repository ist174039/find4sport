import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/search-bar'
import { ProfessionalGrid } from '@/components/professional-card'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import type { Category, Professional } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string; location?: string; sort?: string }>
}

async function getProfessionalsData(searchParams: { category?: string; q?: string; location?: string; sort?: string }) {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('pro_count', { ascending: false })

  let query = supabase.from('professionals').select(`*, categories:professional_categories(category:categories(*))`)
  if (searchParams.q) query = query.or(`full_name.ilike.%${searchParams.q}%,professional_name.ilike.%${searchParams.q}%,bio.ilike.%${searchParams.q}%`)
  if (searchParams.location) query = query.ilike('address', `%${searchParams.location}%`)

  const { data: professionals } = await query.limit(24)
  let filtered = professionals || []
  if (searchParams.category) filtered = filtered.filter((pro) => pro.categories?.some((c: { category: Category }) => c.category?.slug === searchParams.category))

  const transformed = filtered.map((pro) => ({ ...pro, categories: pro.categories?.map((c: { category: Category }) => c.category).filter(Boolean) || [] }))
  const sortBy = searchParams.sort || 'relevance'
  transformed.sort((a, b) => {
    if (sortBy === 'rating') return (b.rating_avg || 0) - (a.rating_avg || 0)
    if (sortBy === 'reviews') return (b.review_count || 0) - (a.review_count || 0)
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return 0
  })

  return { categories: (categories || []) as Category[], professionals: transformed as (Professional & { categories: Category[] })[], filters: searchParams }
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

export default async function ProfissionaisPage({ searchParams }: PageProps) {
  const resolved = await searchParams
  const { categories, professionals, filters } = await getProfessionalsData(resolved)
  const selectedCategory = categories.find((c) => c.slug === filters.category)
  const currentSort = filters.sort || 'relevance'
  const filterRecord = filters as Record<string, string | undefined>

  return (
    <DiscoveryPage
      title={selectedCategory ? `Profissionais de ${selectedCategory.name}` : 'Profissionais de Desporto'}
      description="Encontra profissionais, compara especialidades, avaliações e localização e entra em contacto diretamente."
      countLabel={`${professionals.length} ${professionals.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}`}
      search={<SearchBar defaultQuery={filters.q} defaultLocation={filters.location} defaultType="profissionais" showFilters filterType="profissionais" currentFilters={filters as Record<string, string>} />}
      categories={[
        { label: 'Todos', href: href('/profissionais', filterRecord, { category: null }), active: !filters.category },
        ...categories.slice(0, 10).map((cat) => ({ label: `${cat.emoji || ''} ${cat.name}`.trim(), href: href('/profissionais', filterRecord, { category: cat.slug }), active: filters.category === cat.slug })),
      ]}
      sorts={[
        { label: 'Relevância', href: href('/profissionais', filterRecord, { sort: 'relevance' }), active: currentSort === 'relevance' },
        { label: 'Melhor avaliados', href: href('/profissionais', filterRecord, { sort: 'rating' }), active: currentSort === 'rating' },
        { label: 'Mais avaliados', href: href('/profissionais', filterRecord, { sort: 'reviews' }), active: currentSort === 'reviews' },
        { label: 'Mais recentes', href: href('/profissionais', filterRecord, { sort: 'newest' }), active: currentSort === 'newest' },
      ]}
      clearHref={filters.q || filters.location || filters.category || currentSort !== 'relevance' ? '/profissionais' : undefined}
    >
      {professionals.length ? <ProfessionalGrid professionals={professionals} columns={3} /> : <DiscoveryEmptyState title="Nenhum profissional encontrado" description="Experimenta remover alguns filtros ou pesquisar noutra localização." clearHref="/profissionais" />}
    </DiscoveryPage>
  )
}

export const metadata = {
  title: 'Profissionais de Desporto',
  description: 'Encontre os melhores profissionais de desporto em Portugal.',
}
