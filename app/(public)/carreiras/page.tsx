import { NormalizedContentPage } from '@/components/cms/normalized-page'
import { createClient } from '@/lib/supabase/server'

export default async function CarreirasPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('cms_pages').select('*').eq('slug', 'carreiras').single()

  return (
    <NormalizedContentPage
      title={data?.title || 'Carreiras na FIND4SPORT'}
      description={data?.description ?? undefined}
      content={data?.content}
      loading={false}
      error={error ? 'Página não configurada no painel de administração.' : null}
    />
  )
}
