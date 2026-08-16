'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { getLimit } from '@/lib/billing/entitlements'

type GalleryEntity = { type: 'professional' | 'venue_manager'; id: string }

async function requireGalleryEntity(expected: GalleryEntity) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.role || access.role !== expected.type) throw new Error('Sem permissões para gerir esta galeria.')
  const admin = createAdminClient()
  const table = expected.type === 'professional' ? 'professionals' : 'sport_spaces'
  const ownershipColumn = expected.type === 'professional' ? 'user_id' : 'owner_user_id'
  const { data: entity, error } = await admin.from(table).select('*').eq('id', expected.id).eq(ownershipColumn, user.id).maybeSingle()
  if (error) throw error
  if (!entity) throw new Error('Entidade não encontrada.')
  return { user, admin, table, entity }
}

function storagePathFromUrl(url: string) {
  const marker = '/storage/v1/object/public/avatars/'
  const part = url.split(marker)[1]
  return part ? decodeURIComponent(part.split('?')[0]) : null
}

function revalidateGallery() {
  revalidatePath('/dashboard/galeria')
  revalidatePath('/dashboard/perfil')
  revalidatePath('/dashboard/espaco')
}

export async function registerGalleryUploadsAction(expected: GalleryEntity, paths: string[]) {
  const { user, admin, table, entity } = await requireGalleryEntity(expected)
  const uniquePaths = [...new Set(paths.map(path => String(path || '').trim()).filter(Boolean))]
  if (!uniquePaths.length) throw new Error('Nenhuma fotografia foi recebida.')
  if (uniquePaths.length > 10) throw new Error('Carregue no máximo 10 fotografias de cada vez.')
  if (uniquePaths.some(path => !path.startsWith(`${user.id}/gallery/`))) throw new Error('Caminho de fotografia inválido.')

  const currentPublic = Array.isArray(entity.gallery_urls) ? entity.gallery_urls : []
  const currentPrivate = Array.isArray(entity.private_gallery_urls) ? entity.private_gallery_urls : []
  const limit = await getLimit(user.id, 'profile.photos.max')
  if (limit !== null && currentPublic.length + currentPrivate.length + uniquePaths.length > limit) throw new Error(`O seu plano permite no máximo ${limit} fotografias.`)

  for (const path of uniquePaths) {
    const parts = path.split('/')
    const fileName = parts.pop()!
    const directory = parts.join('/')
    const { data, error } = await admin.storage.from('avatars').list(directory, { search: fileName, limit: 10 })
    if (error || !(data || []).some(item => item.name === fileName)) throw new Error('Uma das fotografias carregadas não foi encontrada no Storage.')
  }

  const urls = uniquePaths.map(path => admin.storage.from('avatars').getPublicUrl(path).data.publicUrl)
  const nextPublic = [...new Set([...currentPublic, ...urls])]
  const { error } = await admin.from(table).update({ gallery_urls: nextPublic }).eq('id', expected.id)
  if (error) throw error
  revalidateGallery()
  return { publicGallery: nextPublic, privateGallery: currentPrivate }
}

export async function toggleGalleryVisibilityAction(expected: GalleryEntity, url: string, makePublic: boolean) {
  const { admin, table, entity } = await requireGalleryEntity(expected)
  const currentPublic = Array.isArray(entity.gallery_urls) ? entity.gallery_urls : []
  const currentPrivate = Array.isArray(entity.private_gallery_urls) ? entity.private_gallery_urls : []
  const all = new Set([...currentPublic, ...currentPrivate])
  if (!all.has(url)) throw new Error('Fotografia não encontrada.')
  const publicGallery = makePublic ? [...new Set([...currentPublic, url])] : currentPublic.filter((item: string) => item !== url)
  const privateGallery = makePublic ? currentPrivate.filter((item: string) => item !== url) : [...new Set([...currentPrivate, url])]
  const { error } = await admin.from(table).update({ gallery_urls: publicGallery, private_gallery_urls: privateGallery }).eq('id', expected.id)
  if (error) throw error
  revalidateGallery()
  return { publicGallery, privateGallery }
}

export async function setGalleryFeaturedImageAction(expected: GalleryEntity, url: string, target: 'cover' | 'avatar') {
  const { user, admin, table, entity } = await requireGalleryEntity(expected)
  const all = new Set([...(entity.gallery_urls || []), ...(entity.private_gallery_urls || [])])
  if (url && !all.has(url)) throw new Error('Fotografia não encontrada.')
  const patch: Record<string, any> = target === 'cover' ? { cover_url: url || null } : expected.type === 'professional' ? { avatar_url: url || null } : { logo_url: url || null }
  const { error } = await admin.from(table).update(patch).eq('id', expected.id)
  if (error) throw error
  if (target === 'avatar' && expected.type === 'professional') await admin.from('platform_users').update({ avatar_url: url || null }).eq('id', user.id)
  revalidateGallery()
  return { value: url || '' }
}

export async function deleteGalleryPhotoAction(expected: GalleryEntity, url: string) {
  const { user, admin, table, entity } = await requireGalleryEntity(expected)
  const currentPublic = Array.isArray(entity.gallery_urls) ? entity.gallery_urls : []
  const currentPrivate = Array.isArray(entity.private_gallery_urls) ? entity.private_gallery_urls : []
  if (![...currentPublic, ...currentPrivate].includes(url)) throw new Error('Fotografia não encontrada.')
  const publicGallery = currentPublic.filter((item: string) => item !== url)
  const privateGallery = currentPrivate.filter((item: string) => item !== url)
  const currentCover = entity.cover_url || ''
  const currentAvatar = expected.type === 'professional' ? entity.avatar_url || '' : entity.logo_url || ''
  const patch: Record<string, any> = { gallery_urls: publicGallery, private_gallery_urls: privateGallery, cover_url: currentCover === url ? null : currentCover || null }
  if (expected.type === 'professional') patch.avatar_url = currentAvatar === url ? null : currentAvatar || null
  else patch.logo_url = currentAvatar === url ? null : currentAvatar || null
  const { error } = await admin.from(table).update(patch).eq('id', expected.id)
  if (error) throw error
  if (expected.type === 'professional' && currentAvatar === url) await admin.from('platform_users').update({ avatar_url: null }).eq('id', user.id)
  const path = storagePathFromUrl(url)
  if (path?.startsWith(`${user.id}/`)) await admin.storage.from('avatars').remove([path])
  revalidateGallery()
  return { publicGallery, privateGallery, cover: patch.cover_url || '', avatar: expected.type === 'professional' ? patch.avatar_url || '' : patch.logo_url || '' }
}
