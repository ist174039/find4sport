import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { SearchBar } from '@/components/search-bar'
import { ProfessionalGrid } from '@/components/professional-card'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import { DiscoveryTaxonomyFilter } from '@/components/discovery-taxonomy-filter'
import { distanceFrom, parseGeoCookie } from '@/lib/geo'
import type { Category, Professional } from '@/lib/types'

interface PageProps { searchParams: Promise<{ category?: string; q?: string; location?: string; sort?: string }> }

async function getProfessionalsData(searchParams: { category?: string; q?: string; location?: string; sort?: string }) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const userLocation = parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const { data: categoryRows, error: categoryError } = await supabase.from('categories').select('*').order('name')
  if (categoryError) throw new Error('Não foi possível carregar as modalidades.')
  const categories = (categoryRows || []) as Category[]
  const selectedCategory = searchParams.category ? categories.find(item => item.slug === searchParams.category) : undefined

  let professionalIdsForCategory: string[] | null = null
  if (selectedCategory) {
    const { data, error } = await supabase.from('professional_categories').select('professional_id').eq('category_id', selectedCategory.id)
    if (error) throw new Error('Não foi possível filtrar profissionais por modalidade.')
    professionalIdsForCategory = (data || []).map(row => row.professional_id)
  }

  let query = supabase.from('professionals').select('*').eq('status', 'active')
  if (searchParams.q) query = query.or(`full_name.ilike.%${searchParams.q}%,professional_name.ilike.%${searchParams.q}%,bio.ilike.%${searchParams.q}%`)
  if (searchParams.location) query = query.ilike('address', `%${searchParams.location}%`)
  if (selectedCategory) query = professionalIdsForCategory?.length ? query.in('id', professionalIdsForCategory) : query.eq('id', '00000000-0000-0000-0000-000000000000')

  const { data: professionalRows, error: professionalsError } = await query.limit(40)
  if (professionalsError) throw new Error(`Não foi possível carregar profissionais: ${professionalsError.message}`)
  const professionals = professionalRows || []

  const categoriesById = new Map(categories.map(category => [category.id, category]))
  const categoryMap = new Map<string, Category[]>()
  if (professionals.length) {
    const ids = professionals.map(item => item.id)
    const { data: links } = await supabase.from('professional_categories').select('professional_id,category_id').in('professional_id', ids)
    for (const link of links || []) {
      const category = categoriesById.get(link.category_id)
      if (!category) continue
      const current = categoryMap.get(link.professional_id) || []
      current.push(category)
      categoryMap.set(link.professional_id, current)
    }
  }

  const transformed = professionals.map(pro => ({ ...pro, categories: categoryMap.get(pro.id) || [], distanceKm: distanceFrom(userLocation, pro.latitude, pro.longitude) }))
  const sortBy = searchParams.sort || 'relevance'
  transformed.sort((a, b) => {
    if (sortBy === 'rating') return (b.rating_avg || 0) - (a.rating_avg || 0)
    if (sortBy === 'reviews') return (b.review_count || 0) - (a.review_count || 0)
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (userLocation) return (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY)
    return (b.rating_avg || 0) - (a.rating_avg || 0)
  })
  return { categories, professionals: transformed as (Professional & { categories: Category[]; distanceKm?: number | null })[], filters: searchParams }
}

function href(base: string, filters: Record<string, string | undefined>, updates: Record<string, string | undefined | null>, defaultSort = 'relevance') {
  const params = new URLSearchParams()
  Object.entries({ ...filters, ...updates }).forEach(([key, value]) => { if (!value || (key === 'sort' && value === defaultSort)) return; params.set(key, value) })
  const qs = params.toString(); return qs ? `${base}?${qs}` : base
}

export default async function ProfissionaisPage({ searchParams }: PageProps) {
  const resolved = await searchParams
  const { categories, professionals, filters } = await getProfessionalsData(resolved)
  const selectedCategory = categories.find(c => c.slug === filters.category)
  const currentSort = filters.sort || 'relevance'
  const filterRecord = filters as Record<string, string | undefined>

  return <DiscoveryPage title={selectedCategory ? `Profissionais de ${selectedCategory.name}` : 'Profissionais de Desporto'} description="Encontra profissionais por modalidade, localização e reputação. Quando permites localização, os mais próximos aparecem primeiro." countLabel={`${professionals.length} ${professionals.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}`} search={<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]"><SearchBar defaultQuery={filters.q} defaultLocation={filters.location} defaultType="profissionais" showType={false} basePath="/profissionais" showFilters filterType="profissionais" currentFilters={filters as Record<string, string>} placeholder="Pesquisar profissionais…" /><DiscoveryTaxonomyFilter basePath="/profissionais" categories={categories} currentCategory={filters.category} query={filters.q} location={filters.location} sort={filters.sort} /></div>} sorts={[{ label: 'Relevância / proximidade', href: href('/profissionais', filterRecord, { sort: 'relevance' }), active: currentSort === 'relevance' }, { label: 'Melhor avaliados', href: href('/profissionais', filterRecord, { sort: 'rating' }), active: currentSort === 'rating' }, { label: 'Mais avaliados', href: href('/profissionais', filterRecord, { sort: 'reviews' }), active: currentSort === 'reviews' }, { label: 'Mais recentes', href: href('/profissionais', filterRecord, { sort: 'newest' }), active: currentSort === 'newest' }]} clearHref={filters.q || filters.location || filters.category || currentSort !== 'relevance' ? '/profissionais' : undefined}>
    {professionals.length ? <ProfessionalGrid professionals={professionals} columns={3} /> : <DiscoveryEmptyState title="Nenhum profissional encontrado" description="Experimenta outra modalidade ou localização." clearHref="/profissionais" />}
  </DiscoveryPage>
}

export const metadata = { title: 'Profissionais de Desporto', description: 'Encontre os melhores profissionais de desporto em Portugal.' }
