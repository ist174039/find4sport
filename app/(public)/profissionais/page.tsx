import { createAdminClient } from '@/lib/supabase/admin'
import { SearchBar } from '@/components/search-bar'
import { ProfessionalGrid } from '@/components/professional-card'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import { DiscoveryTaxonomyFilter } from '@/components/discovery-taxonomy-filter'
import type { Category, Professional } from '@/lib/types'
import { cookies } from 'next/headers'
import { distanceFrom, parseGeoCookie } from '@/lib/geo'

interface PageProps { searchParams: Promise<{ category?: string; q?: string; location?: string; sort?: string }> }

function branchIds(categories: Category[], selectedId: string) {
  const ids = new Set<string>([selectedId])
  let changed = true
  while (changed) {
    changed = false
    for (const category of categories) {
      if (category.parent_id && ids.has(category.parent_id) && !ids.has(category.id)) { ids.add(category.id); changed = true }
    }
  }
  return [...ids]
}

async function getProfessionalsData(filters: { category?: string; q?: string; location?: string; sort?: string }) {
  const admin = createAdminClient()
  const cookieStore = await cookies()
  const userLocation = parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const { data: categoryRows, error: categoryError } = await admin.from('categories').select('*').order('name')
  if (categoryError) throw new Error('Não foi possível carregar as modalidades.')
  const categories = (categoryRows || []) as Category[]
  const selectedCategory = filters.category ? categories.find(item => item.slug === filters.category || item.id === filters.category) : undefined

  let professionalIdsForCategory: string[] | null = null
  if (selectedCategory) {
    const ids = branchIds(categories, selectedCategory.id)
    const { data, error } = await admin.from('professional_categories').select('professional_id').in('category_id', ids)
    if (error) throw new Error('Não foi possível filtrar profissionais por modalidade.')
    professionalIdsForCategory = [...new Set((data || []).map(row => row.professional_id))]
  }

  let query = admin.from('professionals').select('*').eq('status', 'active')
  if (filters.q) query = query.or(`full_name.ilike.%${filters.q}%,professional_name.ilike.%${filters.q}%,bio.ilike.%${filters.q}%`)
  if (filters.location) query = query.ilike('address', `%${filters.location}%`)
  if (selectedCategory) query = professionalIdsForCategory?.length ? query.in('id', professionalIdsForCategory) : query.eq('id', '00000000-0000-0000-0000-000000000000')

  const { data: rows, error } = await query.limit(100)
  if (error) throw new Error(`Não foi possível carregar profissionais: ${error.message}`)
  const professionals = rows || []
  const categoryMap = new Map<string, Category[]>()
  if (professionals.length) {
    const { data: links } = await admin.from('professional_categories').select('professional_id,category_id').in('professional_id', professionals.map(item => item.id))
    const byId = new Map(categories.map(category => [category.id, category]))
    for (const link of links || []) {
      const category = byId.get(link.category_id); if (!category) continue
      categoryMap.set(link.professional_id, [...(categoryMap.get(link.professional_id) || []), category])
    }
  }

  const transformed = professionals.map(pro => ({ ...pro, categories: categoryMap.get(pro.id) || [], distanceKm: distanceFrom(userLocation, pro.latitude, pro.longitude) }))
  const sortBy = filters.sort || 'relevance'
  transformed.sort((a, b) => {
    if (sortBy === 'rating') return Number(b.rating_avg || 0) - Number(a.rating_avg || 0)
    if (sortBy === 'reviews') return Number(b.review_count || 0) - Number(a.review_count || 0)
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (userLocation) return (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY)
    return Number(b.rating_avg || 0) - Number(a.rating_avg || 0)
  })
  return { categories, professionals: transformed as (Professional & { categories: Category[]; distanceKm?: number | null })[], filters }
}

function href(base: string, filters: Record<string, string | undefined>, updates: Record<string, string | undefined | null>) {
  const params = new URLSearchParams()
  Object.entries({ ...filters, ...updates }).forEach(([key, value]) => { if (!value || (key === 'sort' && value === 'relevance')) return; params.set(key, value) })
  return params.size ? `${base}?${params}` : base
}

export default async function ProfissionaisPage({ searchParams }: PageProps) {
  const resolved = await searchParams
  const { categories, professionals, filters } = await getProfessionalsData(resolved)
  const selectedCategory = categories.find(c => c.slug === filters.category || c.id === filters.category)
  const currentSort = filters.sort || 'relevance'
  const filterRecord = filters as Record<string, string | undefined>

  return <DiscoveryPage
    title={selectedCategory ? `Profissionais de ${selectedCategory.name}` : 'Profissionais de Desporto'}
    description="Encontra profissionais ativos por modalidade, proximidade, localização e reputação."
    countLabel={`${professionals.length} ${professionals.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}`}
    search={<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]"><SearchBar defaultQuery={filters.q} defaultLocation={filters.location} defaultType="profissionais" showType={false} basePath="/profissionais" showFilters filterType="profissionais" currentFilters={filters as Record<string, string>} placeholder="Pesquisar profissionais…" /><DiscoveryTaxonomyFilter basePath="/profissionais" categories={categories} currentCategory={filters.category} query={filters.q} location={filters.location} sort={filters.sort} /></div>}
    sorts={[
      { label: 'Mais próximos', href: href('/profissionais', filterRecord, { sort: 'relevance' }), active: currentSort === 'relevance' },
      { label: 'Melhor avaliados', href: href('/profissionais', filterRecord, { sort: 'rating' }), active: currentSort === 'rating' },
      { label: 'Mais avaliados', href: href('/profissionais', filterRecord, { sort: 'reviews' }), active: currentSort === 'reviews' },
      { label: 'Mais recentes', href: href('/profissionais', filterRecord, { sort: 'newest' }), active: currentSort === 'newest' },
    ]}
    clearHref={filters.q || filters.location || filters.category || currentSort !== 'relevance' ? '/profissionais' : undefined}
  >
    {professionals.length ? <ProfessionalGrid professionals={professionals} columns={3} /> : <DiscoveryEmptyState title="Nenhum profissional encontrado" description="Não existem profissionais ativos para esta combinação de filtros." clearHref="/profissionais" />}
  </DiscoveryPage>
}

export const metadata = { title: 'Profissionais de Desporto', description: 'Encontre profissionais de desporto em Portugal.' }
