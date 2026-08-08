'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canCreatePostForRole, normalizePlatformRole } from '@/lib/auth/roles'
import { revalidatePath } from 'next/cache'

export async function createPostAction(content: string, media_url?: string | null, media_type?: string | null) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilizador não autenticado')

    const { data: profile } = await supabase
      .from('platform_users')
      .select('type')
      .eq('id', user.id)
      .maybeSingle()

    const role = normalizePlatformRole(profile?.type ?? user.user_metadata?.type)
    if (!canCreatePostForRole(role)) {
      throw new Error('Atletas não podem publicar no feed.')
    }

    const trimmedContent = content.trim()
    if (!trimmedContent && !media_url) {
      throw new Error('A publicação não pode estar vazia.')
    }
    if (trimmedContent.length > 5000) {
      throw new Error('A publicação excede o limite de 5000 caracteres.')
    }

    let professional_id = null
    let sport_space_id = null

    const { data: space } = await supabase
      .from('sport_spaces')
      .select('id')
      .eq('owner_user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (space) {
      sport_space_id = space.id
    } else {
      const { data: prof } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (prof) {
        professional_id = prof.id
      } else {
        throw new Error('Apenas profissionais registados e espaços podem publicar.')
      }
    }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin.from('posts').insert({
      professional_id,
      sport_space_id,
      content: trimmedContent,
      media_url: media_url || null,
      media_type: media_type || null,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return { error: error.message || 'Erro ao criar publicação na base de dados.' }
    }

    revalidatePath('/feed')
    return { success: true }
  } catch (err: any) {
    console.error('Server action catch error:', err)
    return { error: err.message || 'Ocorreu um erro no servidor.' }
  }
}

export async function toggleLikeAction(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária')

  // check if liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    // unlike
    await supabase.from('post_likes').delete().eq('id', existing.id)
    return { liked: false }
  } else {
    // like
    await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
    return { liked: true }
  }
}

export async function addCommentAction(postId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária')

  const trimmedContent = content.trim()
  if (!trimmedContent) throw new Error('Comentário vazio')
  if (trimmedContent.length > 2000) throw new Error('Comentário demasiado longo')

  const { error } = await supabase.from('post_comments').insert({
    post_id: postId,
    user_id: user.id,
    content: trimmedContent
  })

  if (error) throw new Error('Erro ao comentar')

  return { success: true }
}
