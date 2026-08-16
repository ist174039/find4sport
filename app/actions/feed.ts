'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canCreatePostForRole, parsePlatformRole } from '@/lib/auth/roles'
import { assertWithinUsageLimit, incrementUsage, isFeatureEnabled } from '@/lib/billing/entitlements'
import { revalidatePath } from 'next/cache'

export async function createPostAction(content: string, media_url?: string | null, media_type?: string | null) {
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

    const trimmedContent = content.trim()
    if (!trimmedContent && !media_url) throw new Error('A publicação não pode estar vazia.')
    if (trimmedContent.length > 5000) throw new Error('A publicação excede o limite de 5000 caracteres.')

    const normalizedMediaType = media_type?.toLowerCase() || null
    if (normalizedMediaType?.startsWith('video') && !(await isFeatureEnabled(user.id, 'feed.video.enabled'))) {
      throw new Error('Publicação de vídeo não está disponível no seu plano.')
    }

    let professional_id = null
    let sport_space_id = null
    if (role === 'venue_manager') {
      const { data: space } = await admin.from('sport_spaces').select('id').eq('owner_user_id', user.id).limit(1).maybeSingle()
      if (!space) throw new Error('Espaço desportivo não encontrado.')
      sport_space_id = space.id
    } else {
      const { data: prof } = await admin.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
      if (!prof) throw new Error('Perfil profissional não encontrado.')
      professional_id = prof.id
    }

    const { error } = await admin.from('posts').insert({ professional_id, sport_space_id, content: trimmedContent, media_url: media_url || null, media_type: normalizedMediaType })
    if (error) return { error: error.message || 'Erro ao criar publicação na base de dados.' }

    await incrementUsage(user.id, 'feed.posts_daily.max', 'day')
    revalidatePath('/feed')
    return { success: true }
  } catch (err: any) {
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
  const { data: postExists } = await supabase.from('posts').select('id').eq('id', postId).maybeSingle()
  if (!postExists) throw new Error('Publicação não encontrada')
  const { error } = await supabase.from('post_comments').insert({ post_id: postId, user_id: user.id, content: trimmedContent })
  if (error) throw new Error('Erro ao comentar')
  return { success: true }
}
