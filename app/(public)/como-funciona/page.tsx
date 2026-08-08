import { NormalizedContentPage } from '@/components/cms/normalized-page'
import { createClient } from '@/lib/supabase/server'

export default async function ComoFuncionaPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('cms_pages').select('*').eq('slug', 'como-funciona').single()

  return (
    <NormalizedContentPage 
      title={data?.title || 'Como Funciona a Plataforma'}
      description={data?.description}
      content={data?.content?.body}
      loading={false}
      error={error ? 'Página não configurada no painel de administração.' : null}
    />
  )
}
