import { createClient } from '@/lib/supabase/server'
import { CategoriesManager } from '@/components/admin/categories-manager'

export default async function Page() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('id,name,slug,emoji,color,icon_key,code,taxonomy_type,is_active,parent_id,created_at').order('taxonomy_type').order('name')
  if (error) throw new Error(`Não foi possível carregar a taxonomia: ${error.message}`)
  return <CategoriesManager initialCategories={data || []} />
}
