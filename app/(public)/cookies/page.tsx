import { NormalizedContentPage } from '@/components/cms/normalized-page'
import { createClient } from '@/lib/supabase/server'

export default async function CookiesPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('cms_pages').select('*').eq('slug', 'cookies').single()

  return (
    <NormalizedContentPage 
      title={data?.title || 'Política de Cookies'}
      description={data?.description}
      content={data?.content?.body}
      loading={false}
      error={error ? 'Página não configurada no painel de administração.' : null}
    />
  )
}
