'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminPermission } from '@/lib/auth/authorization'
import { getCmsPage } from '@/lib/cms/registry'
import { writeAdminAudit } from '@/lib/admin/audit'
import type { CMSBlock } from '@/components/cms/block-builder'
import type { Json } from '@/lib/supabase-types'

function toJson(value: unknown): Json {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.map(toJson)
  if (typeof value === 'object') {
    const result: { [key: string]: Json | undefined } = {}
    for (const [key, item] of Object.entries(value)) {
      if (item !== undefined) result[key] = toJson(item)
    }
    return result
  }
  throw new Error('Conteúdo CMS contém um valor não serializável.')
}

export async function loadCmsPageAction(slug: string) {
  const definition = getCmsPage(slug)
  if (!definition) throw new Error('Página CMS inválida.')
  const { admin } = await requireAdminPermission('content.moderate')
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
  const { user, admin } = await requireAdminPermission('content.moderate')

  const blocks = (input.blocks || []).filter(block => ['hero', 'text', 'image'].includes(block.type))
  const payload = {
    slug: definition.slug,
    title: input.title.trim() || definition.title,
    description: input.description.trim() || null,
    is_published: Boolean(input.isPublished),
    content: toJson({ blocks }),
    updated_at: new Date().toISOString(),
  }

  const { error } = await admin.from('cms_pages').upsert(payload, { onConflict: 'slug' })
  if (error) throw error

  await writeAdminAudit(admin as any, {
    action: 'UPDATE',
    tableName: 'cms_pages',
    userEmail: user.email || 'admin',
    message: `Página CMS ${definition.slug} atualizada`,
    data: { slug: definition.slug, published: payload.is_published, blocks: blocks.length },
  })

  revalidatePath(`/${definition.slug}`)
  revalidatePath('/admin/paginas')
  revalidatePath(`/admin/paginas/${definition.slug}`)
  return { success: true }
}
