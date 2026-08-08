import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/search-bar'
import { SpaceGrid } from '@/components/space-card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import type { Category, SportSpace } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string; location?: string; sort?: string }>
}

async function getSpacesData(searchParams: { category?: string; q?: string; location?: string; sort?: string }) {
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('space_count', { ascending: false })

  // Build spaces query
  let query = supabase
    .from('sport_spaces')
    .select(`
      *,
      categories:space_categories(
        category:categories(*)
      )
    `)

  // Apply filters
  if (searchParams.q) {
    query = query.or(`name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  }

  if (searchParams.location) {
    query = query.ilike('address', `%${searchParams.location}%`)
  }

  const { data: spaces } = await query
    .limit(24)

  // Filter by category after fetch
  let filteredSpaces = spaces || []
  if (searchParams.category) {
    filteredSpaces = filteredSpaces.filter(space =>
      space.categories?.some((c: { category: Category }) => c.category?.slug === searchParams.category)
    )
  }

  // Transform spaces
  const transformedSpaces = filteredSpaces.map(space => ({
    ...space,
    categories: space.categories?.map((c: { category: Category }) => c.category).filter(Boolean) || []
  }))

  const sortBy = searchParams.sort || 'relevance'
  transformedSpaces.sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.rating_avg || 0) - (a.rating_avg || 0)
    }
    if (sortBy === 'reviews') {
      return (b.review_count || 0) - (a.review_count || 0)
    }
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return 0
  })

  return {
    categories: (categories || []) as Category[],
    spaces: transformedSpaces as (SportSpace & { categories: Category[] })[],
    filters: searchParams,
  }
}

function SpacesSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default async function EspacosPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const { categories, spaces, filters } = await getSpacesData(resolvedParams)

  const selectedCategory = categories.find(c => c.slug === filters.category)
  const currentSort = filters.sort || 'relevance'

  const buildFilterHref = (nextCategory?: string) => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.location) params.set('location', filters.location)
    if (currentSort !== 'relevance') params.set('sort', currentSort)
    if (nextCategory) params.set('category', nextCategory)
    const queryString = params.toString()
    return queryString ? `/espacos?${queryString}` : '/espacos'
  }

  const buildSortHref = (nextSort: string) => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.location) params.set('location', filters.location)
    if (filters.category) params.set('category', filters.category)
    if (nextSort !== 'relevance') params.set('sort', nextSort)
    const queryString = params.toString()
    return queryString ? `/espacos?${queryString}` : '/espacos'
  }

  return (
    <div className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="border-b border-border bg-muted/30 py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              {selectedCategory
                ? `Espacos de ${selectedCategory.name}`
                : 'Espacos Desportivos'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {spaces.length} espacos encontrados
            </p>

            {/* Search */}
            <div className="mt-6">
              <SearchBar
                defaultQuery={filters.q}
                defaultLocation={filters.location}
                defaultType="espacos"
                showFilters
                filterType="espacos"
                currentFilters={filters as Record<string, string>}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground">Ordenar:</span>
              <Link href={buildSortHref('relevance')} className={`rounded-full border px-3 py-1.5 ${currentSort === 'relevance' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}>Relevancia</Link>
              <Link href={buildSortHref('rating')} className={`rounded-full border px-3 py-1.5 ${currentSort === 'rating' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}>Melhor avaliados</Link>
              <Link href={buildSortHref('reviews')} className={`rounded-full border px-3 py-1.5 ${currentSort === 'reviews' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}>Mais avaliados</Link>
              <Link href={buildSortHref('newest')} className={`rounded-full border px-3 py-1.5 ${currentSort === 'newest' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}>Mais recentes</Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-b border-border py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Link
                href={buildFilterHref()}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !filters.category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Todos
              </Link>
              {categories.slice(0, 10).map((cat) => (
                <Link
                  key={cat.id}
                  href={buildFilterHref(cat.slug)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    filters.category === cat.slug
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {cat.emoji} {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<SpacesSkeleton />}>
              {spaces.length > 0 ? (
                <SpaceGrid spaces={spaces} columns={3} />
              ) : (
                <div className="py-12 text-center">
                  <p className="text-lg text-muted-foreground">
                    Nenhum espaco encontrado com os filtros selecionados.
                  </p>
                  <Link
                    href="/espacos"
                    className="mt-4 inline-block text-primary hover:underline"
                  >
                    Limpar filtros
                  </Link>
                </div>
              )}
            </Suspense>
          </div>
        </section>

</div>
  )
}

export const metadata = {
  title: 'Espacos Desportivos',
  description: 'Encontre ginasios, campos, piscinas e outros espacos desportivos em Portugal.',
}
