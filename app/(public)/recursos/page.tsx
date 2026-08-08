import { NormalizedContentPage } from '@/components/cms/normalized-page'
import { createClient } from '@/lib/supabase/server'

export default async function RecursosPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('cms_pages').select('*').eq('slug', 'recursos').single()

  return (
    <NormalizedContentPage 
      title={data?.title || 'Recursos e Ajuda'}
      description={data?.description}
      content={data?.content?.body}
      loading={false}
      error={error ? 'Página não configurada no painel de administração.' : null}
    />
  )
}
