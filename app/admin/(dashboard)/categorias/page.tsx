import { createClient } from '@/lib/supabase/server'
import { CategoriesManager } from '@/components/admin/categories-manager'
import type { Category, TaxonomyType } from '@/lib/types'

const taxonomyTypes = new Set<TaxonomyType>(['modality', 'profession', 'specialty', 'service'])

export default async function Page() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('id,name,slug,emoji,color,icon_key,code,taxonomy_type,is_active,parent_id,created_at').order('taxonomy_type').order('name')
  if (error) throw new Error(`Não foi possível carregar a taxonomia: ${error.message}`)
  const categories: Category[] = (data || [])
    .filter(row => taxonomyTypes.has(row.taxonomy_type as TaxonomyType))
    .map(row => ({ ...row, taxonomy_type: row.taxonomy_type as TaxonomyType }))
  return <CategoriesManager initialCategories={categories} />
}
