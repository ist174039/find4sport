import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/search-bar'
import { EventGrid } from '@/components/event-card'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import { DiscoveryTaxonomyFilter } from '@/components/discovery-taxonomy-filter'
import type { Category, Event } from '@/lib/types'

interface PageProps { searchParams: Promise<{ category?: string; q?: string; location?: string; sort?: string }> }

async function getEventsData(searchParams: { category?: string; q?: string; location?: string; sort?: string }) {
  const supabase = await createClient()
  const { data: categoryRows, error: categoryError } = await supabase.from('categories').select('*').order('name')
  if (categoryError) throw new Error('Não foi possível carregar as modalidades.')
  const categories = (categoryRows || []) as Category[]
  const selectedCategory = searchParams.category ? categories.find(item => item.slug === searchParams.category) : undefined

  let query = supabase.from('events').select('*').eq('status', 'published')
  if (searchParams.q) query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  if (searchParams.location) query = query.ilike('address', `%${searchParams.location}%`)
  if (selectedCategory) query = query.eq('category_id', selectedCategory.id)
  const { data: eventRows, error: eventsError } = await query.limit(24)
  if (eventsError) throw new Error(`Não foi possível carregar eventos: ${eventsError.message}`)

  const transformed = (eventRows || []).map(event => ({ ...event, category: event.category_id ? categories.find(category => category.id === event.category_id) || null : null }))
  const sortBy = searchParams.sort || 'upcoming'
  transformed.sort((a, b) => sortBy === 'newest' ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : sortBy === 'popular' ? (b.views_count || 0) - (a.views_count || 0) : new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
  return { categories, events: transformed as (Event & { category: Category | null })[], filters: searchParams }
}

function href(base: string, filters: Record<string, string | undefined>, updates: Record<string, string | undefined | null>, defaultSort = 'upcoming') {
  const params = new URLSearchParams(); Object.entries({ ...filters, ...updates }).forEach(([key, value]) => { if (!value || (key === 'sort' && value === defaultSort)) return; params.set(key, value) }); const qs = params.toString(); return qs ? `${base}?${qs}` : base
}

export default async function EventosPage({ searchParams }: PageProps) {
  const resolved = await searchParams
  const { categories, events, filters } = await getEventsData(resolved)
  const selectedCategory = categories.find(c => c.slug === filters.category)
  const currentSort = filters.sort || 'upcoming'
  const filterRecord = filters as Record<string, string | undefined>
  return <DiscoveryPage
    title={selectedCategory ? `Eventos de ${selectedCategory.name}` : 'Eventos Desportivos'}
    description="Descobre eventos por modalidade, localização e data."
    countLabel={`${events.length} ${events.length === 1 ? 'evento encontrado' : 'eventos encontrados'}`}
    search={<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]"><SearchBar defaultQuery={filters.q} defaultLocation={filters.location} defaultType="eventos" showType={false} basePath="/eventos" showFilters filterType="eventos" currentFilters={filters as Record<string, string>} placeholder="Pesquisar eventos…" /><DiscoveryTaxonomyFilter basePath="/eventos" categories={categories} currentCategory={filters.category} query={filters.q} location={filters.location} sort={filters.sort} /></div>}
    sorts={[
      { label: 'Próximos', href: href('/eventos', filterRecord, { sort: 'upcoming' }), active: currentSort === 'upcoming' },
      { label: 'Mais recentes', href: href('/eventos', filterRecord, { sort: 'newest' }), active: currentSort === 'newest' },
      { label: 'Mais vistos', href: href('/eventos', filterRecord, { sort: 'popular' }), active: currentSort === 'popular' },
    ]}
    clearHref={filters.q || filters.location || filters.category || currentSort !== 'upcoming' ? '/eventos' : undefined}
  >{events.length ? <EventGrid events={events} columns={3} /> : <DiscoveryEmptyState title="Nenhum evento encontrado" description="Experimenta outra modalidade ou localização." clearHref="/eventos" />}</DiscoveryPage>
}

export const metadata = { title: 'Eventos Desportivos', description: 'Descubra os melhores eventos desportivos em Portugal.' }
