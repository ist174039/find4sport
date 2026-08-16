import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NormalizedContentPage } from '@/components/cms/normalized-page'

export async function PublicCmsPage({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cms_pages')
    .select('title, description, content, is_published')
    .eq('slug', slug)
    .maybeSingle()

  if (!data || !data.is_published) notFound()

  return (
    <NormalizedContentPage
      title={data.title || fallbackTitle}
      description={data.description || undefined}
      content={data.content}
      loading={false}
    />
  )
}
