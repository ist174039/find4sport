'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'

type CommunityScope = 'online' | 'local' | 'regional' | 'national'
type PostingPolicy = 'members' | 'reactions_only' | 'admin_only'

async function requireCommunityAdmin(communityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')
  const access = await resolveSessionAccess(supabase, user)
  if (access?.role !== 'professional') throw new Error('Apenas profissionais podem gerir comunidades.')
  const admin = createAdminClient()
  const { data: membership } = await admin.from('community_members').select('id').eq('community_id', communityId).eq('user_id', user.id).eq('role', 'admin').maybeSingle()
  if (!membership) throw new Error('Sem permissões para gerir esta comunidade.')
  return { user, admin }
}

function revalidateCommunity(communityId: string) {
  revalidatePath(`/dashboard/comunidades/${communityId}`)
  revalidatePath('/dashboard/comunidades')
  revalidatePath(`/comunidades/${communityId}`)
  revalidatePath('/comunidades')
}

function optionalSchemaMissing(error: any) {
  const code = String(error?.code || '')
  const message = String(error?.message || '')
  return ['42P01', '42703', 'PGRST204', 'PGRST205'].includes(code) || /community_categories|community_media|schema cache/i.test(message)
}

export async function updateCommunityAction(communityId: string, formData: FormData) {
  const { admin } = await requireCommunityAdmin(communityId)
  const name = String(formData.get('name') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const categoryId = String(formData.get('category_id') || '').trim()
  const isPrivate = formData.get('is_private') === 'on'
  const requestedScope = String(formData.get('location_scope') || 'online')
  const requestedPolicy = String(formData.get('posting_policy') || 'members')
  const locationScope: CommunityScope = ['online', 'local', 'regional', 'national'].includes(requestedScope) ? requestedScope as CommunityScope : 'online'
  const postingPolicy: PostingPolicy = ['members', 'reactions_only', 'admin_only'].includes(requestedPolicy) ? requestedPolicy as PostingPolicy : 'members'
  const address = locationScope === 'online' ? null : String(formData.get('address') || '').trim().slice(0, 180) || null

  if (name.length < 3 || name.length > 160) throw new Error('O nome deve ter entre 3 e 160 caracteres.')
  if (description.length > 5000) throw new Error('A descrição não pode exceder 5000 caracteres.')
  if (!categoryId) throw new Error('Seleciona uma modalidade.')

  const { data: category, error: categoryError } = await admin.from('categories').select('id,name').eq('id', categoryId).maybeSingle()
  if (categoryError || !category) throw new Error('A modalidade selecionada já não está disponível.')

  const { error } = await admin.from('communities').update({
    name,
    description: description || null,
    is_private: isPrivate,
    sport_category: category.name,
    posting_policy: postingPolicy,
    location_scope: locationScope,
    address,
    latitude: locationScope === 'online' ? null : undefined,
    longitude: locationScope === 'online' ? null : undefined,
  }).eq('id', communityId)
  if (error) throw new Error(`Não foi possível guardar a comunidade: ${error.message}`)

  const relationClient = admin as unknown as { from: (table: string) => any }
  const deleteResult = await relationClient.from('community_categories').delete().eq('community_id', communityId)
  if (!deleteResult.error) {
    const insertResult = await relationClient.from('community_categories').insert({ community_id: communityId, category_id: category.id })
    if (insertResult.error && !optionalSchemaMissing(insertResult.error)) throw new Error('Não foi possível guardar a modalidade da comunidade.')
  } else if (!optionalSchemaMissing(deleteResult.error)) {
    throw new Error('Não foi possível atualizar a taxonomia da comunidade.')
  }

  revalidateCommunity(communityId)
}

export async function setCommunityMemberRoleAction(communityId: string, memberUserId: string, role: 'admin' | 'member') {
  const { admin } = await requireCommunityAdmin(communityId)
  const { data: target } = await admin.from('community_members').select('id,role').eq('community_id', communityId).eq('user_id', memberUserId).maybeSingle()
  if (!target) throw new Error('Membro não encontrado.')
  if (target.role === role) return

  if (target.role === 'admin' && role === 'member') {
    const { count, error: countError } = await admin.from('community_members').select('id', { count: 'exact', head: true }).eq('community_id', communityId).eq('role', 'admin')
    if (countError) throw new Error('Não foi possível validar os administradores da comunidade.')
    if ((count || 0) <= 1) throw new Error('A comunidade tem de manter pelo menos um administrador.')
  }

  const { error } = await admin.from('community_members').update({ role }).eq('id', target.id)
  if (error) throw new Error('Não foi possível alterar a função do membro.')
  revalidateCommunity(communityId)
}

export async function setCommunityCoverAction(communityId: string, storagePath: string) {
  const { user, admin } = await requireCommunityAdmin(communityId)
  const path = String(storagePath || '').trim()
  const prefix = `${user.id}/communities/${communityId}/`
  if (!path.startsWith(prefix)) throw new Error('Imagem de capa inválida.')
  const parts = path.split('/')
  const fileName = parts.pop()!
  const directory = parts.join('/')
  const { data, error: listError } = await admin.storage.from('avatars').list(directory, { search: fileName, limit: 10 })
  if (listError || !(data || []).some(item => item.name === fileName)) throw new Error('A imagem carregada não foi encontrada no Storage.')
  const coverUrl = admin.storage.from('avatars').getPublicUrl(path).data.publicUrl
  const { error } = await admin.from('communities').update({ cover_url: coverUrl }).eq('id', communityId)
  if (error) throw new Error(`Não foi possível atualizar a capa: ${error.message}`)
  revalidateCommunity(communityId)
  return { coverUrl }
}

export async function removeCommunityMemberAction(communityId: string, memberUserId: string) {
  const { user, admin } = await requireCommunityAdmin(communityId)
  if (memberUserId === user.id) throw new Error('Não pode remover a sua própria administração nesta operação.')
  const { data: target } = await admin.from('community_members').select('id,role').eq('community_id', communityId).eq('user_id', memberUserId).maybeSingle()
  if (!target) return
  if (target.role === 'admin') {
    const { count } = await admin.from('community_members').select('id', { count: 'exact', head: true }).eq('community_id', communityId).eq('role', 'admin')
    if ((count || 0) <= 1) throw new Error('A comunidade tem de manter pelo menos um administrador.')
  }
  const { error } = await admin.from('community_members').delete().eq('id', target.id)
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
  if (insertError) { await admin.storage.from('community-media').remove([path]); throw insertError }
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
