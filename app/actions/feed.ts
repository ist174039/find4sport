'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canCreatePostForRole, parsePlatformRole } from '@/lib/auth/roles'
import { assertWithinUsageLimit, incrementUsage, isFeatureEnabled } from '@/lib/billing/entitlements'
import { revalidatePath } from 'next/cache'

const MAX_POST_MEDIA_BYTES = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])

export async function createPostAction(formData: FormData) {
  let uploadedPath: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilizador não autenticado')
    const admin = createAdminClient()
    const { data: profile } = await admin.from('platform_users').select('type').eq('id', user.id).maybeSingle()
    const role = parsePlatformRole(profile?.type)
    if (!role || !canCreatePostForRole(role)) throw new Error('Apenas profissionais e gestores de espaço podem publicar no feed.')
    if (!(await isFeatureEnabled(user.id, 'feed.create.enabled'))) throw new Error('Publicações no feed não estão disponíveis no seu plano.')
    await assertWithinUsageLimit(user.id, 'feed.posts_daily.max', 'day')

    const content = String(formData.get('content') || '').trim()
    if (content.length > 5000) throw new Error('A publicação excede o limite de 5000 caracteres.')
    const media = formData.get('media')
    const file = media instanceof File && media.size > 0 ? media : null
    if (!content && !file) throw new Error('A publicação não pode estar vazia.')

    let mediaUrl: string | null = null
    let mediaType: 'image' | 'video' | null = null
    if (file) {
      if (file.size > MAX_POST_MEDIA_BYTES) throw new Error('O ficheiro não pode exceder 10 MB.')
      const isImage = ALLOWED_IMAGE_TYPES.has(file.type)
      const isVideo = ALLOWED_VIDEO_TYPES.has(file.type)
      if (!isImage && !isVideo) throw new Error('Formato de media não suportado. Use JPEG, PNG, WebP, MP4, WebM ou MOV.')
      if (isVideo && !(await isFeatureEnabled(user.id, 'feed.video.enabled'))) throw new Error('Publicação de vídeo não está disponível no seu plano.')
      const extensionMap: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' }
      uploadedPath = `${user.id}/posts/${crypto.randomUUID()}.${extensionMap[file.type]}`
      const { error: uploadError } = await admin.storage.from('avatars').upload(uploadedPath, file, { cacheControl: '3600', upsert: false, contentType: file.type })
      if (uploadError) throw new Error(`Não foi possível carregar o ficheiro: ${uploadError.message}`)
      mediaUrl = admin.storage.from('avatars').getPublicUrl(uploadedPath).data.publicUrl
      mediaType = isVideo ? 'video' : 'image'
    }

    let professional_id: string | null = null
    let sport_space_id: string | null = null
    if (role === 'venue_manager') {
      const { data: space } = await admin.from('sport_spaces').select('id').eq('owner_user_id', user.id).eq('is_verified', true).limit(1).maybeSingle()
      if (!space) throw new Error('Não existe um espaço verificado associado à sua conta.')
      sport_space_id = space.id
    } else {
      const { data: prof } = await admin.from('professionals').select('id').eq('user_id', user.id).eq('is_verified', true).eq('status', 'active').maybeSingle()
      if (!prof) throw new Error('O perfil profissional precisa de estar ativo e verificado para publicar.')
      professional_id = prof.id
    }

    const { data: post, error } = await admin.from('posts').insert({ professional_id, sport_space_id, content, media_url: mediaUrl, media_type: mediaType }).select('id').single()
    if (error) throw new Error(error.message || 'Erro ao criar publicação na base de dados.')
    await incrementUsage(user.id, 'feed.posts_daily.max', 'day')
    revalidatePath('/feed')
    return { success: true, postId: post.id }
  } catch (err: any) {
    if (uploadedPath) { try { createAdminClient().storage.from('avatars').remove([uploadedPath]) } catch {} }
    return { error: err.message || 'Ocorreu um erro no servidor.' }
  }
}

export async function toggleLikeAction(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária')
  const { error: insertError } = await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
  if (!insertError) return { liked: true }
  if ((insertError as any)?.code === '23505') {
    const { error: deleteError } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
    if (deleteError) throw new Error('Erro ao remover gosto')
    return { liked: false }
  }
  throw new Error('Erro ao atualizar gosto')
}

export async function addCommentAction(postId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária')
  const trimmedContent = content.trim()
  if (!trimmedContent) throw new Error('Comentário vazio')
  if (trimmedContent.length > 2000) throw new Error('Comentário demasiado longo')

  const admin = createAdminClient()
  const { data: post } = await admin.from('posts').select('id, community_id').eq('id', postId).maybeSingle()
  if (!post) throw new Error('Publicação não encontrada')

  if ((post as any).community_id) {
    const communityId = (post as any).community_id
    const [{ data: member }, { data: community }] = await Promise.all([
      admin.from('community_members').select('role').eq('community_id', communityId).eq('user_id', user.id).maybeSingle(),
      admin.from('communities').select('*').eq('id', communityId).maybeSingle(),
    ])
    if (!member) throw new Error('Apenas membros podem comentar nesta comunidade.')
    const policy = (community as any)?.posting_policy || 'members'
    if (policy === 'reactions_only' && member.role !== 'admin') throw new Error('Nesta comunidade, os membros podem apenas colocar gosto nas publicações.')
    if (policy === 'admin_only' && member.role !== 'admin') throw new Error('Apenas administradores podem comentar nesta comunidade.')
  }

  const { error } = await admin.from('post_comments').insert({ post_id: postId, user_id: user.id, content: trimmedContent })
  if (error) throw new Error('Erro ao comentar')
  return { success: true }
}

export async function reportPostAction(postId: string, reason: 'spam' | 'harassment' | 'hate' | 'nudity' | 'violence' | 'fraud' | 'other' = 'other', details?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária')
  const { data: postExists } = await supabase.from('posts').select('id').eq('id', postId).maybeSingle()
  if (!postExists) throw new Error('Publicação não encontrada')
  const cleanDetails = details?.trim().slice(0, 2000) || null
  const { error } = await supabase.from('content_reports').insert({ reporter_user_id: user.id, target_type: 'post', target_id: postId, reason, details: cleanDetails })
  if (error) {
    if ((error as any)?.code === '23505') return { success: true, duplicate: true }
    throw new Error('Não foi possível enviar a denúncia.')
  }
  return { success: true, duplicate: false }
}
