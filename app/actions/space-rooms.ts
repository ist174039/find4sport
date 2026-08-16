'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireManagedSpace(spaceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')

  const admin = createAdminClient()
  const { data: space } = await admin
    .from('sport_spaces')
    .select('id')
    .eq('id', spaceId)
    .or(`owner_user_id.eq.${user.id},created_by.eq.${user.id}`)
    .maybeSingle()

  if (!space) throw new Error('Não tem permissão para gerir este espaço.')
  return { admin, user }
}

async function requireManagedRoom(roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')

  const admin = createAdminClient()
  const { data: room } = await admin
    .from('space_rooms')
    .select('id, space_id, gallery_urls')
    .eq('id', roomId)
    .maybeSingle()

  if (!room) throw new Error('Sala/campo não encontrado.')

  const { data: space } = await admin
    .from('sport_spaces')
    .select('id')
    .eq('id', room.space_id)
    .or(`owner_user_id.eq.${user.id},created_by.eq.${user.id}`)
    .maybeSingle()

  if (!space) throw new Error('Não tem permissão para gerir esta sala/campo.')
  return { admin, user, room }
}

export async function createSpaceRoomAction(input: {
  spaceId: string
  name: string
  description?: string
  capacity: number
  pricePerHour: number
}) {
  const { admin } = await requireManagedSpace(input.spaceId)
  const name = input.name.trim()
  if (!name) throw new Error('O nome é obrigatório.')
  if (!Number.isFinite(input.capacity) || input.capacity < 1) throw new Error('A capacidade é inválida.')
  if (!Number.isFinite(input.pricePerHour) || input.pricePerHour < 0) throw new Error('O preço é inválido.')

  const { data, error } = await admin
    .from('space_rooms')
    .insert({
      space_id: input.spaceId,
      name,
      description: input.description?.trim() || null,
      capacity: Math.floor(input.capacity),
      price_per_hour: input.pricePerHour,
      is_active: true,
      gallery_urls: [],
    })
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message || 'Não foi possível criar a sala/campo.')
  revalidatePath('/dashboard/espacos/salas')
  return data
}

export async function deleteSpaceRoomAction(roomId: string) {
  const { admin } = await requireManagedRoom(roomId)
  const { error } = await admin.from('space_rooms').delete().eq('id', roomId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/espacos/salas')
  return { success: true }
}

export async function updateSpaceRoomGalleryAction(roomId: string, galleryUrls: string[]) {
  const { admin } = await requireManagedRoom(roomId)
  const cleanUrls = galleryUrls.filter((url) => typeof url === 'string' && /^https:\/\//i.test(url)).slice(0, 100)
  const { error } = await admin.from('space_rooms').update({ gallery_urls: cleanUrls }).eq('id', roomId)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/espacos/salas')
  return { success: true, galleryUrls: cleanUrls }
}
