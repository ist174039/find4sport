'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { getCmsPage } from '@/lib/cms/registry'
import type { CMSBlock } from '@/components/cms/block-builder'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão administrativa inválida.')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) throw new Error('Acesso administrativo necessário.')
  return { user, admin: createAdminClient() }
}

export async function loadCmsPageAction(slug: string) {
  const definition = getCmsPage(slug)
  if (!definition) throw new Error('Página CMS inválida.')
  const { admin } = await requireAdmin()
  const { data, error } = await admin.from('cms_pages').select('id, slug, title, description, content, is_published, updated_at').eq('slug', slug).maybeSingle()
  if (error) throw error
  return { definition, page: data }
}

export async function saveCmsPageAction(input: {
  slug: string
  title: string
  description: string
  isPublished: boolean
  blocks: CMSBlock[]
}) {
  const definition = getCmsPage(input.slug)
  if (!definition) throw new Error('Página CMS inválida.')
  const { user, admin } = await requireAdmin()

  const blocks = (input.blocks || []).filter(block => ['hero', 'text', 'image'].includes(block.type))
  const payload = {
    slug: definition.slug,
    title: input.title.trim() || definition.title,
    description: input.description.trim() || null,
    is_published: Boolean(input.isPublished),
    content: { blocks },
    updated_at: new Date().toISOString(),
  }

  const { error } = await admin.from('cms_pages').upsert(payload, { onConflict: 'slug' })
  if (error) throw error

  await admin.from('audit_logs').insert({
    admin_id: user.id,
    action: 'cms.page.updated',
    entity_type: 'cms_page',
    entity_id: definition.slug,
    details: { published: payload.is_published, blocks: blocks.length },
  }).then(() => undefined)

  revalidatePath(`/${definition.slug}`)
  revalidatePath('/admin/paginas')
  revalidatePath(`/admin/paginas/${definition.slug}`)
  return { success: true }
}
