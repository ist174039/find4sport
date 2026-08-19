'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { getLimit } from '@/lib/billing/entitlements'
import type { Tables } from '@/lib/supabase-types'

type GalleryEntity = { type: 'professional' | 'venue_manager'; id: string }
type ProfessionalGalleryEntity = Pick<Tables<'professionals'>, 'id' | 'gallery_urls' | 'private_gallery_urls' | 'cover_url' | 'avatar_url'>
type SpaceGalleryEntity = Pick<Tables<'sport_spaces'>, 'id' | 'gallery_urls' | 'private_gallery_urls' | 'cover_url' | 'logo_url'>

type GalleryContext =
  | { type: 'professional'; userId: string; admin: ReturnType<typeof createAdminClient>; entity: ProfessionalGalleryEntity }
  | { type: 'venue_manager'; userId: string; admin: ReturnType<typeof createAdminClient>; entity: SpaceGalleryEntity }

async function requireGalleryEntity(expected: GalleryEntity): Promise<GalleryContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.role || access.role !== expected.type) throw new Error('Sem permissões para gerir esta galeria.')
  const admin = createAdminClient()

  if (expected.type === 'professional') {
    const { data: entity, error } = await admin.from('professionals').select('id,gallery_urls,private_gallery_urls,cover_url,avatar_url').eq('id', expected.id).eq('user_id', user.id).maybeSingle()
    if (error) throw error
    if (!entity) throw new Error('Entidade não encontrada.')
    return { type: 'professional', userId: user.id, admin, entity }
  }

  const { data: entity, error } = await admin.from('sport_spaces').select('id,gallery_urls,private_gallery_urls,cover_url,logo_url').eq('id', expected.id).eq('owner_user_id', user.id).maybeSingle()
  if (error) throw error
  if (!entity) throw new Error('Entidade não encontrada.')
  return { type: 'venue_manager', userId: user.id, admin, entity }
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

function galleries(entity: ProfessionalGalleryEntity | SpaceGalleryEntity) {
  return {
    currentPublic: Array.isArray(entity.gallery_urls) ? entity.gallery_urls : [],
    currentPrivate: Array.isArray(entity.private_gallery_urls) ? entity.private_gallery_urls : [],
  }
}

export async function registerGalleryUploadsAction(expected: GalleryEntity, paths: string[]) {
  const context = await requireGalleryEntity(expected)
  const { admin, entity, userId } = context
  const uniquePaths = [...new Set(paths.map(path => String(path || '').trim()).filter(Boolean))]
  if (!uniquePaths.length) throw new Error('Nenhuma fotografia foi recebida.')
  if (uniquePaths.length > 10) throw new Error('Carregue no máximo 10 fotografias de cada vez.')
  if (uniquePaths.some(path => !path.startsWith(`${userId}/gallery/`))) throw new Error('Caminho de fotografia inválido.')

  const { currentPublic, currentPrivate } = galleries(entity)
  const limit = await getLimit(userId, 'profile.photos.max')
  if (limit !== null && currentPublic.length + currentPrivate.length + uniquePaths.length > limit) throw new Error(`O seu plano permite no máximo ${limit} fotografias.`)

  for (const path of uniquePaths) {
    const parts = path.split('/')
    const fileName = parts.pop()
    if (!fileName) throw new Error('Caminho de fotografia inválido.')
    const directory = parts.join('/')
    const { data, error } = await admin.storage.from('avatars').list(directory, { search: fileName, limit: 10 })
    if (error || !(data || []).some(item => item.name === fileName)) throw new Error('Uma das fotografias carregadas não foi encontrada no Storage.')
  }

  const urls = uniquePaths.map(path => admin.storage.from('avatars').getPublicUrl(path).data.publicUrl)
  const nextPublic = [...new Set([...currentPublic, ...urls])]
  const result = context.type === 'professional'
    ? await admin.from('professionals').update({ gallery_urls: nextPublic }).eq('id', expected.id)
    : await admin.from('sport_spaces').update({ gallery_urls: nextPublic }).eq('id', expected.id)
  if (result.error) throw result.error
  revalidateGallery()
  return { publicGallery: nextPublic, privateGallery: currentPrivate }
}

export async function toggleGalleryVisibilityAction(expected: GalleryEntity, url: string, makePublic: boolean) {
  const context = await requireGalleryEntity(expected)
  const { admin, entity } = context
  const { currentPublic, currentPrivate } = galleries(entity)
  const all = new Set([...currentPublic, ...currentPrivate])
  if (!all.has(url)) throw new Error('Fotografia não encontrada.')
  const publicGallery = makePublic ? [...new Set([...currentPublic, url])] : currentPublic.filter(item => item !== url)
  const privateGallery = makePublic ? currentPrivate.filter(item => item !== url) : [...new Set([...currentPrivate, url])]
  const patch = { gallery_urls: publicGallery, private_gallery_urls: privateGallery }
  const result = context.type === 'professional'
    ? await admin.from('professionals').update(patch).eq('id', expected.id)
    : await admin.from('sport_spaces').update(patch).eq('id', expected.id)
  if (result.error) throw result.error
  revalidateGallery()
  return { publicGallery, privateGallery }
}

export async function setGalleryFeaturedImageAction(expected: GalleryEntity, url: string, target: 'cover' | 'avatar') {
  const context = await requireGalleryEntity(expected)
  const { admin, entity, userId } = context
  const { currentPublic, currentPrivate } = galleries(entity)
  const all = new Set([...currentPublic, ...currentPrivate])
  if (url && !all.has(url)) throw new Error('Fotografia não encontrada.')
  const value = url || null

  if (target === 'cover') {
    const result = context.type === 'professional'
      ? await admin.from('professionals').update({ cover_url: value }).eq('id', expected.id)
      : await admin.from('sport_spaces').update({ cover_url: value }).eq('id', expected.id)
    if (result.error) throw result.error
  } else if (context.type === 'professional') {
    const { error } = await admin.from('professionals').update({ avatar_url: value }).eq('id', expected.id)
    if (error) throw error
    const { error: profileError } = await admin.from('platform_users').update({ avatar_url: value }).eq('id', userId)
    if (profileError) throw profileError
  } else {
    const { error } = await admin.from('sport_spaces').update({ logo_url: value }).eq('id', expected.id)
    if (error) throw error
  }

  revalidateGallery()
  return { value: url || '' }
}

export async function deleteGalleryPhotoAction(expected: GalleryEntity, url: string) {
  const context = await requireGalleryEntity(expected)
  const { admin, userId } = context
  const { currentPublic, currentPrivate } = galleries(context.entity)
  if (![...currentPublic, ...currentPrivate].includes(url)) throw new Error('Fotografia não encontrada.')

  const publicGallery = currentPublic.filter(item => item !== url)
  const privateGallery = currentPrivate.filter(item => item !== url)
  const currentCover = context.entity.cover_url || ''
  let featuredImage = ''

  if (context.type === 'professional') {
    const currentAvatar = context.entity.avatar_url || ''
    featuredImage = currentAvatar === url ? '' : currentAvatar
    const { error } = await admin.from('professionals').update({
      gallery_urls: publicGallery,
      private_gallery_urls: privateGallery,
      cover_url: currentCover === url ? null : currentCover || null,
      avatar_url: currentAvatar === url ? null : currentAvatar || null,
    }).eq('id', expected.id)
    if (error) throw error
    if (currentAvatar === url) {
      const { error: profileError } = await admin.from('platform_users').update({ avatar_url: null }).eq('id', userId)
      if (profileError) throw profileError
    }
  } else {
    const currentLogo = context.entity.logo_url || ''
    featuredImage = currentLogo === url ? '' : currentLogo
    const { error } = await admin.from('sport_spaces').update({
      gallery_urls: publicGallery,
      private_gallery_urls: privateGallery,
      cover_url: currentCover === url ? null : currentCover || null,
      logo_url: currentLogo === url ? null : currentLogo || null,
    }).eq('id', expected.id)
    if (error) throw error
  }

  const path = storagePathFromUrl(url)
  if (path?.startsWith(`${userId}/`)) await admin.storage.from('avatars').remove([path])
  revalidateGallery()
  return {
    publicGallery,
    privateGallery,
    cover: currentCover === url ? '' : currentCover,
    avatar: featuredImage,
  }
}
