import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/search-bar'
import { ProfessionalGrid } from '@/components/professional-card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import type { Category, Professional } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string; location?: string; sort?: string }>
}

async function getProfessionalsData(searchParams: { category?: string; q?: string; location?: string; sort?: string }) {
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('pro_count', { ascending: false })

  // Build professionals query
  let query = supabase
    .from('professionals')
    .select(`
      *,
      categories:professional_categories(
        category:categories(*)
      )
    `)

  // Apply filters
  if (searchParams.q) {
    query = query.or(`full_name.ilike.%${searchParams.q}%,professional_name.ilike.%${searchParams.q}%,bio.ilike.%${searchParams.q}%`)
  }

  if (searchParams.location) {
    query = query.ilike('address', `%${searchParams.location}%`)
  }

  const { data: professionals } = await query
    .limit(24)

  // Filter by category after fetch (due to nested relation)
  let filteredProfessionals = professionals || []
  if (searchParams.category) {
    filteredProfessionals = filteredProfessionals.filter(pro =>
      pro.categories?.some((c: { category: Category }) => c.category?.slug === searchParams.category)
    )
  }

  // Transform professionals
  const transformedProfessionals = filteredProfessionals.map(pro => ({
    ...pro,
    categories: pro.categories?.map((c: { category: Category }) => c.category).filter(Boolean) || []
  }))

  const sortBy = searchParams.sort || 'relevance'
  transformedProfessionals.sort((a, b) => {
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
    professionals: transformedProfessionals as (Professional & { categories: Category[] })[],
    filters: searchParams,
  }
}

function ProfessionalsSkeleton() {
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

export default async function ProfissionaisPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const { categories, professionals, filters } = await getProfessionalsData(resolvedParams)

  const selectedCategory = categories.find(c => c.slug === filters.category)
  const currentSort = filters.sort || 'relevance'

  const buildFilterHref = (nextCategory?: string) => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.location) params.set('location', filters.location)
    if (currentSort !== 'relevance') params.set('sort', currentSort)
    if (nextCategory) params.set('category', nextCategory)
    const queryString = params.toString()
    return queryString ? `/profissionais?${queryString}` : '/profissionais'
  }

  const buildSortHref = (nextSort: string) => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.location) params.set('location', filters.location)
    if (filters.category) params.set('category', filters.category)
    if (nextSort !== 'relevance') params.set('sort', nextSort)
    const queryString = params.toString()
    return queryString ? `/profissionais?${queryString}` : '/profissionais'
  }

  return (
    <div className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="border-b border-border bg-muted/30 py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              {selectedCategory
                ? `Profissionais de ${selectedCategory.name}`
                : 'Profissionais de Desporto'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {professionals.length} profissionais encontrados
            </p>

            {/* Search */}
            <div className="mt-6">
              <SearchBar
                defaultQuery={filters.q}
                defaultLocation={filters.location}
                defaultType="profissionais"
                showFilters
                filterType="profissionais"
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
            <Suspense fallback={<ProfessionalsSkeleton />}>
              {professionals.length > 0 ? (
                <ProfessionalGrid professionals={professionals} columns={3} />
              ) : (
                <div className="py-12 text-center">
                  <p className="text-lg text-muted-foreground">
                    Nenhum profissional encontrado com os filtros selecionados.
                  </p>
                  <Link
                    href="/profissionais"
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
  title: 'Profissionais de Desporto',
  description: 'Encontre os melhores profissionais de desporto em Portugal. Personal trainers, instrutores de yoga, treinadores de natacao e muito mais.',
}
