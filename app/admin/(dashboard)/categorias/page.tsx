import { createClient } from '@/lib/supabase/server'
import { CategoriesManager } from '@/components/admin/categories-manager'

export default async function Page() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('id,name,slug,emoji,color,created_at,parent_id,icon_key,taxonomy_type,code,is_active').order('name', { ascending: true })
  if (error) throw new Error(`Não foi possível carregar as categorias: ${error.message}`)
  return <CategoriesManager initialCategories={(data || []) as any} />
}
