import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { CategoriesManager } from '@/components/admin/categories-manager'
export default async function Page(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/admin/login');const access=await resolveSessionAccess(supabase,user);if(!access?.canAccessAdmin)redirect('/admin/login?error=unauthorized');const admin=createAdminClient();const{data,error}=await admin.from('categories').select('id,name,slug,icon_key,color,parent_id,created_at').order('name',{ascending:true});if(error)throw new Error(`Não foi possível carregar as categorias: ${error.message}`);return <CategoriesManager initialCategories={data||[]}/>}
