import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SearchBar } from '@/components/search-bar'
import { SpaceGrid } from '@/components/space-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Category, SportSpace } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string; location?: string }>
}

async function getSpacesData(searchParams: { category?: string; q?: string; location?: string }) {
  const supabase = await createClient()

  // Get user
  const { data: { user } } = await supabase.auth.getUser()

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
    .eq('status', 'approved')

  // Apply filters
  if (searchParams.q) {
    query = query.or(`name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  }

  if (searchParams.location) {
    query = query.ilike('address', `%${searchParams.location}%`)
  }

  const { data: spaces } = await query
    .order('rating_avg', { ascending: false })
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

  return {
    user: user ? {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
    } : null,
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
  const { user, categories, spaces, filters } = await getSpacesData(resolvedParams)

  const selectedCategory = categories.find(c => c.slug === filters.category)

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">
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
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-b border-border py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <a
                href="/espacos"
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !filters.category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Todos
              </a>
              {categories.slice(0, 10).map((cat) => (
                <a
                  key={cat.id}
                  href={`/espacos?category=${cat.slug}`}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    filters.category === cat.slug
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {cat.emoji} {cat.name}
                </a>
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
                  <a
                    href="/espacos"
                    className="mt-4 inline-block text-primary hover:underline"
                  >
                    Limpar filtros
                  </a>
                </div>
              )}
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export const metadata = {
  title: 'Espacos Desportivos',
  description: 'Encontre ginasios, campos, piscinas e outros espacos desportivos em Portugal.',
}
