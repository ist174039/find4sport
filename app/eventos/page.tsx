import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SearchBar } from '@/components/search-bar'
import { EventGrid } from '@/components/event-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Category, Event } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string; location?: string }>
}

async function getEventsData(searchParams: { category?: string; q?: string; location?: string }) {
  const supabase = await createClient()

  // Get user
  const { data: { user } } = await supabase.auth.getUser()

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
    .eq('status', 'approved')
    .gte('start_date', new Date().toISOString())

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

  const { data: events } = await query
    .order('start_date', { ascending: true })
    .limit(24)

  return {
    user: user ? {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
    } : null,
    categories: (categories || []) as Category[],
    events: (events || []) as (Event & { category: Category })[],
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
  const { user, categories, events, filters } = await getEventsData(resolvedParams)

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
                ? `Eventos de ${selectedCategory.name}`
                : 'Eventos Desportivos'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {events.length} eventos proximos
            </p>

            {/* Search */}
            <div className="mt-6">
              <SearchBar
                defaultQuery={filters.q}
                defaultLocation={filters.location}
                defaultType="eventos"
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
                href="/eventos"
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
                  href={`/eventos?category=${cat.slug}`}
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
            <Suspense fallback={<EventsSkeleton />}>
              {events.length > 0 ? (
                <EventGrid events={events} columns={3} />
              ) : (
                <div className="py-12 text-center">
                  <p className="text-lg text-muted-foreground">
                    Nenhum evento encontrado com os filtros selecionados.
                  </p>
                  <a
                    href="/eventos"
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
  title: 'Eventos Desportivos',
  description: 'Descubra os melhores eventos desportivos em Portugal. Maratonas, torneios, workshops e muito mais.',
}
