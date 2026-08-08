import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/search-bar'
import { EventGrid } from '@/components/event-card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import type { Category, Event } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string; location?: string; sort?: string }>
}

async function getEventsData(searchParams: { category?: string; q?: string; location?: string; sort?: string }) {
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('event_count', { ascending: false })

  // Build events query
  let query = supabase
    .from('events')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('status', 'published')

  // Apply filters
  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  }

  if (searchParams.location) {
    query = query.ilike('address', `%${searchParams.location}%`)
  }

  if (searchParams.category) {
    const cat = categories?.find(c => c.slug === searchParams.category)
    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  const { data: events } = await query.limit(24)

  const transformedEvents = [...(events || [])]
  const sortBy = searchParams.sort || 'upcoming'
  transformedEvents.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy === 'popular') {
      return (b.views_count || 0) - (a.views_count || 0)
    }
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  })

  return {
    categories: (categories || []) as Category[],
    events: transformedEvents as (Event & { category: Category })[],
    filters: searchParams,
  }
}

function EventsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[16/10] w-full rounded-xl" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default async function EventosPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const { categories, events, filters } = await getEventsData(resolvedParams)

  const selectedCategory = categories.find(c => c.slug === filters.category)
  const currentSort = filters.sort || 'upcoming'

  const buildFilterHref = (nextCategory?: string) => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.location) params.set('location', filters.location)
    if (currentSort !== 'upcoming') params.set('sort', currentSort)
    if (nextCategory) params.set('category', nextCategory)
    const queryString = params.toString()
    return queryString ? `/eventos?${queryString}` : '/eventos'
  }

  const buildSortHref = (nextSort: string) => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.location) params.set('location', filters.location)
    if (filters.category) params.set('category', filters.category)
    if (nextSort !== 'upcoming') params.set('sort', nextSort)
    const queryString = params.toString()
    return queryString ? `/eventos?${queryString}` : '/eventos'
  }

  return (
    <div className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="border-b border-border bg-muted/30 py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
              {selectedCategory
                ? `Eventos de ${selectedCategory.name}`
                : 'Eventos Desportivos'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {events.length} eventos encontrados
            </p>

            {/* Search */}
            <div className="mt-6">
              <SearchBar
                defaultQuery={filters.q}
                defaultLocation={filters.location}
                defaultType="eventos"
                showFilters
                filterType="eventos"
                currentFilters={filters as Record<string, string>}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground">Ordenar:</span>
              <Link href={buildSortHref('upcoming')} className={`rounded-full border px-3 py-1.5 ${currentSort === 'upcoming' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}>Proximos</Link>
              <Link href={buildSortHref('newest')} className={`rounded-full border px-3 py-1.5 ${currentSort === 'newest' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}>Mais recentes</Link>
              <Link href={buildSortHref('popular')} className={`rounded-full border px-3 py-1.5 ${currentSort === 'popular' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}>Mais vistos</Link>
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
            <Suspense fallback={<EventsSkeleton />}>
              {events.length > 0 ? (
                <EventGrid events={events} columns={3} />
              ) : (
                <div className="py-12 text-center">
                  <p className="text-lg text-muted-foreground">
                    Nenhum evento encontrado com os filtros selecionados.
                  </p>
                  <Link
                    href="/eventos"
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
  title: 'Eventos Desportivos',
  description: 'Descubra os melhores eventos desportivos em Portugal. Maratonas, torneios, workshops e muito mais.',
}
