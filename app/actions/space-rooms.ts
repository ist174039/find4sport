'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getLimit } from '@/lib/billing/entitlements'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

async function requireManagedSpace(spaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')
  const admin = createAdminClient()
  const { data: space } = await admin.from('sport_spaces').select('id').eq('id', spaceId).eq('owner_user_id', user.id).maybeSingle()
  if (!space) throw new Error('Não tem permissão para gerir este espaço.')
  return { admin, user }
}

async function requireManagedRoom(roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')
  const admin = createAdminClient()
  const { data: room } = await admin.from('space_rooms').select('id,space_id,gallery_urls,name').eq('id', roomId).maybeSingle()
  if (!room) throw new Error('Sala/campo não encontrado.')
  const { data: space } = await admin.from('sport_spaces').select('id').eq('id', room.space_id).eq('owner_user_id', user.id).maybeSingle()
  if (!space) throw new Error('Não tem permissão para gerir esta sala/campo.')
  return { admin, user, room }
}

function validateRoom(input: { name: string; description?: string; capacity: number; pricePerHour: number }) {
  const name = input.name.trim()
  if (!name) throw new Error('O nome é obrigatório.')
  if (name.length > 160) throw new Error('O nome é demasiado longo.')
  const description = input.description?.trim() || null
  if (description && description.length > 3000) throw new Error('A descrição não pode exceder 3000 caracteres.')
  const capacity = Number(input.capacity)
  const price = Number(input.pricePerHour)
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100000) throw new Error('A capacidade é inválida.')
  if (!Number.isFinite(price) || price < 0 || price > 100000) throw new Error('O preço é inválido.')
  return { name, description, capacity, price_per_hour: price }
}

export async function createSpaceRoomAction(input: { spaceId: string; name: string; description?: string; capacity: number; pricePerHour: number }) {
  const { admin } = await requireManagedSpace(input.spaceId)
  const clean = validateRoom(input)
  const { data, error } = await admin.from('space_rooms').insert({ space_id: input.spaceId, ...clean, is_active: true, gallery_urls: [] }).select('*').single()
  if (error || !data) throw new Error(error?.message || 'Não foi possível criar a sala/campo.')
  revalidatePath('/dashboard/espacos/salas')
  return data
}

export async function updateSpaceRoomAction(roomId: string, input: { name: string; description?: string; capacity: number; pricePerHour: number }) {
  const { admin } = await requireManagedRoom(roomId)
  const clean = validateRoom(input)
  const { data, error } = await admin.from('space_rooms').update(clean).eq('id', roomId).select('*').single()
  if (error || !data) throw new Error(error?.message || 'Não foi possível atualizar a sala/campo.')
  revalidatePath('/dashboard/espacos/salas')
  return data
}

export async function toggleSpaceRoomAction(roomId: string, isActive: boolean) {
  const { admin } = await requireManagedRoom(roomId)
  const { data, error } = await admin.from('space_rooms').update({ is_active: Boolean(isActive) }).eq('id', roomId).select('*').single()
  if (error || !data) throw new Error(error?.message || 'Não foi possível alterar o estado.')
  revalidatePath('/dashboard/espacos/salas')
  return data
}

export async function deleteSpaceRoomAction(roomId: string) {
  const { admin } = await requireManagedRoom(roomId)
  const { error } = await admin.from('space_rooms').delete().eq('id', roomId)
  if (error) {
    if ((error as any).code === '23503') throw new Error('Esta sala/campo tem reservas ou histórico associado. Desative-a em vez de eliminar.')
    throw new Error(error.message)
  }
  revalidatePath('/dashboard/espacos/salas')
  return { success: true }
}

export async function uploadSpaceRoomPhotosAction(roomId: string, formData: FormData) {
  const { admin, user, room } = await requireManagedRoom(roomId)
  const files = formData.getAll('files').filter((value): value is File => value instanceof File && value.size > 0)
  if (!files.length) throw new Error('Selecione pelo menos uma fotografia.')
  const current = Array.isArray(room.gallery_urls) ? room.gallery_urls : []
  const limit = await getLimit(user.id, 'profile.photos.max')
  if (limit !== null && current.length + files.length > limit) throw new Error(`O seu plano permite até ${limit} fotografias por sala/campo.`)

  const uploaded: { path: string; url: string }[] = []
  try {
    for (const file of files) {
      if (!IMAGE_TYPES.has(file.type)) throw new Error('Apenas JPEG, PNG e WebP são permitidos.')
      if (file.size > MAX_IMAGE_BYTES) throw new Error('Cada fotografia pode ter no máximo 5 MB.')
      const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      const path = `${user.id}/rooms/${roomId}/${crypto.randomUUID()}.${extension}`
      const { error: uploadError } = await admin.storage.from('avatars').upload(path, file, { contentType: file.type, cacheControl: '3600', upsert: false })
      if (uploadError) throw new Error(uploadError.message)
      const { data } = admin.storage.from('avatars').getPublicUrl(path)
      uploaded.push({ path, url: data.publicUrl })
    }
    const galleryUrls = [...current, ...uploaded.map(item => item.url)]
    const { error } = await admin.from('space_rooms').update({ gallery_urls: galleryUrls }).eq('id', roomId)
    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/espacos/salas')
    return { galleryUrls }
  } catch (error) {
    if (uploaded.length) await admin.storage.from('avatars').remove(uploaded.map(item => item.path))
    throw error
  }
}

export async function addSpaceRoomPhotoUrlAction(roomId: string, url: string) {
  const { admin, user, room } = await requireManagedRoom(roomId)
  const cleanUrl = url.trim()
  if (!/^https:\/\//i.test(cleanUrl)) throw new Error('Utilize um URL HTTPS válido.')
  const current = Array.isArray(room.gallery_urls) ? room.gallery_urls : []
  const limit = await getLimit(user.id, 'profile.photos.max')
  if (limit !== null && current.length >= limit) throw new Error(`O seu plano permite até ${limit} fotografias por sala/campo.`)
  if (current.includes(cleanUrl)) return { galleryUrls: current }
  const galleryUrls = [...current, cleanUrl]
  const { error } = await admin.from('space_rooms').update({ gallery_urls: galleryUrls }).eq('id', roomId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/espacos/salas')
  return { galleryUrls }
}

export async function removeSpaceRoomPhotoAction(roomId: string, url: string) {
  const { admin, user, room } = await requireManagedRoom(roomId)
  const current = Array.isArray(room.gallery_urls) ? room.gallery_urls : []
  const galleryUrls = current.filter((item: string) => item !== url)
  const { error } = await admin.from('space_rooms').update({ gallery_urls: galleryUrls }).eq('id', roomId)
  if (error) throw new Error(error.message)

  const marker = '/storage/v1/object/public/avatars/'
  const path = url.split(marker)[1]
  if (path?.startsWith(`${user.id}/rooms/${roomId}/`)) await admin.storage.from('avatars').remove([path])
  revalidatePath('/dashboard/espacos/salas')
  return { galleryUrls }
}
