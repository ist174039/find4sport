import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/search-bar'
import { EventGrid } from '@/components/event-card'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import { getSportFamily } from '@/lib/sports-taxonomy'
import type { Category, Event } from '@/lib/types'

interface PageProps { searchParams: Promise<{ category?: string; q?: string; location?: string; sort?: string }> }

async function getEventsData(searchParams: { category?: string; q?: string; location?: string; sort?: string }) {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  let query = supabase.from('events').select('*, category:categories(*)').eq('status', 'published')
  if (searchParams.q) query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  if (searchParams.location) query = query.ilike('address', `%${searchParams.location}%`)
  if (searchParams.category) { const category = categories?.find(item => item.slug === searchParams.category); if (category) query = query.eq('category_id', category.id) }
  const { data: events } = await query.limit(24)
  const transformed = [...(events || [])]
  const sortBy = searchParams.sort || 'upcoming'
  transformed.sort((a, b) => sortBy === 'newest' ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : sortBy === 'popular' ? (b.views_count || 0) - (a.views_count || 0) : new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
  return { categories: (categories || []) as Category[], events: transformed as (Event & { category: Category })[], filters: searchParams }
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
    description="Descobre eventos pela família desportiva, modalidade, localização e data."
    countLabel={`${events.length} ${events.length === 1 ? 'evento encontrado' : 'eventos encontrados'}`}
    search={<SearchBar defaultQuery={filters.q} defaultLocation={filters.location} defaultType="eventos" showType={false} basePath="/eventos" showFilters filterType="eventos" currentFilters={filters as Record<string, string>} placeholder="Pesquisar eventos…" />}
    categories={[
      { label: 'Todas as modalidades', href: href('/eventos', filterRecord, { category: null }), active: !filters.category },
      ...categories.map(cat => { const family = getSportFamily(cat.name); return { label: `${cat.emoji || family.emoji} ${cat.name}`.trim(), group: `${family.emoji} ${family.name}`, href: href('/eventos', filterRecord, { category: cat.slug }), active: filters.category === cat.slug } }),
    ]}
    sorts={[
      { label: 'Próximos', href: href('/eventos', filterRecord, { sort: 'upcoming' }), active: currentSort === 'upcoming' },
      { label: 'Mais recentes', href: href('/eventos', filterRecord, { sort: 'newest' }), active: currentSort === 'newest' },
      { label: 'Mais vistos', href: href('/eventos', filterRecord, { sort: 'popular' }), active: currentSort === 'popular' },
    ]}
    clearHref={filters.q || filters.location || filters.category || currentSort !== 'upcoming' ? '/eventos' : undefined}
  >{events.length ? <EventGrid events={events} columns={3} /> : <DiscoveryEmptyState title="Nenhum evento encontrado" description="Experimenta outra família, modalidade ou localização." clearHref="/eventos" />}</DiscoveryPage>
}

export const metadata = { title: 'Eventos Desportivos', description: 'Descubra os melhores eventos desportivos em Portugal.' }
