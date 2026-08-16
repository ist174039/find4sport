'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'

async function requireCommunityAdmin(communityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')
  const access = await resolveSessionAccess(supabase, user)
  if (access?.role !== 'professional') throw new Error('Apenas profissionais podem gerir comunidades.')

  const admin = createAdminClient()
  const { data: membership } = await admin
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()
  if (!membership) throw new Error('Sem permissões para gerir esta comunidade.')
  return { user, admin }
}

function revalidateCommunity(communityId: string) {
  revalidatePath(`/dashboard/comunidades/${communityId}`)
  revalidatePath('/dashboard/comunidades')
  revalidatePath(`/comunidades/${communityId}`)
  revalidatePath('/comunidades')
}

export async function updateCommunityAction(communityId: string, input: { name: string; description: string; isPrivate: boolean; sportCategory?: string }) {
  const { admin } = await requireCommunityAdmin(communityId)
  const name = input.name.trim()
  if (!name) throw new Error('O nome é obrigatório.')
  const { error } = await admin.from('communities').update({
    name,
    description: input.description.trim() || null,
    is_private: input.isPrivate,
    sport_category: input.sportCategory?.trim() || null,
  }).eq('id', communityId)
  if (error) throw error
  revalidateCommunity(communityId)
}

export async function removeCommunityMemberAction(communityId: string, memberUserId: string) {
  const { user, admin } = await requireCommunityAdmin(communityId)
  if (memberUserId === user.id) throw new Error('Não pode remover a sua própria administração nesta operação.')
  const { error } = await admin.from('community_members').delete().eq('community_id', communityId).eq('user_id', memberUserId)
  if (error) throw error
  revalidateCommunity(communityId)
}

export async function deleteCommunityPostAction(communityId: string, postId: string) {
  const { admin } = await requireCommunityAdmin(communityId)
  const { error } = await admin.from('posts').delete().eq('id', postId).eq('community_id', communityId)
  if (error) throw error
  revalidateCommunity(communityId)
}

export async function uploadCommunityMediaAction(communityId: string, formData: FormData) {
  const { user, admin } = await requireCommunityAdmin(communityId)
  const file = formData.get('file')
  const caption = String(formData.get('caption') || '').trim()
  if (!(file instanceof File) || file.size === 0) throw new Error('Selecione uma imagem.')
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Formato não suportado. Use JPEG, PNG ou WebP.')
  if (file.size > 8 * 1024 * 1024) throw new Error('A imagem não pode exceder 8 MB.')

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${communityId}/${user.id}/${crypto.randomUUID()}.${extension}`
  const bytes = new Uint8Array(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage.from('community-media').upload(path, bytes, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError

  const { error: insertError } = await admin.from('community_media').insert({ community_id: communityId, uploaded_by: user.id, storage_path: path, caption: caption || null })
  if (insertError) {
    await admin.storage.from('community-media').remove([path])
    throw insertError
  }
  revalidateCommunity(communityId)
}

export async function deleteCommunityMediaAction(communityId: string, mediaId: string) {
  const { admin } = await requireCommunityAdmin(communityId)
  const { data: media } = await admin.from('community_media').select('id, storage_path').eq('id', mediaId).eq('community_id', communityId).maybeSingle()
  if (!media) throw new Error('Imagem não encontrada.')
  await admin.storage.from('community-media').remove([media.storage_path])
  const { error } = await admin.from('community_media').delete().eq('id', media.id)
  if (error) throw error
  revalidateCommunity(communityId)
}
