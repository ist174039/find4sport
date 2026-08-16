'use client'

import { useRouter } from 'next/navigation'
import { TaxonomyCombobox, type TaxonomyOption } from '@/components/taxonomy-combobox'

export function DiscoveryTaxonomyFilter({
  basePath,
  categories,
  currentCategory,
  query,
  location,
  sort,
}: {
  basePath: string
  categories: TaxonomyOption[]
  currentCategory?: string
  query?: string
  location?: string
  sort?: string
}) {
  const router = useRouter()
  const selected = categories.find(item => item.slug === currentCategory || item.id === currentCategory)

  const navigate = (categoryId: string) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (location) params.set('location', location)
    if (sort) params.set('sort', sort)
    const category = categories.find(item => item.id === categoryId)
    if (category) params.set('category', category.slug)
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath)
  }

  return (
    <div className="w-full sm:max-w-sm">
      <TaxonomyCombobox
        options={categories}
        value={selected?.id || ''}
        onChange={navigate}
        placeholder="Todas as modalidades"
        searchPlaceholder="Pesquisar modalidade…"
      />
    </div>
  )
}
