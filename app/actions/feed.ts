'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPostAction(content: string, media_url?: string | null, media_type?: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')

  // Check if professional
  const { data: profile } = await supabase
    .from('platform_users')
    .select('type')
    .eq('id', user.id)
    .single()

  if (profile?.type !== 'professional' && profile?.type !== 'espaco') {
    throw new Error('Apenas profissionais e espaços podem publicar no feed público.')
  }

  let professional_id = null
  let sport_space_id = null

  if (profile.type === 'professional') {
    professional_id = user.id
  } else if (profile.type === 'espaco') {
    const { data: space } = await supabase
      .from('sport_spaces')
      .select('id')
      .eq('owner_user_id', user.id)
      .limit(1)
      .maybeSingle()
      
    if (!space) {
      throw new Error('Espaço não encontrado para este utilizador.')
    }
    sport_space_id = space.id
  }

  const { error } = await supabase.from('posts').insert({
    professional_id,
    sport_space_id,
    content,
    media_url: media_url || null,
    media_type: media_type || null
  })

  if (error) {
    console.error(error)
    throw new Error('Erro ao publicar')
  }

  revalidatePath('/feed')
  return { success: true }
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

  const { error } = await supabase.from('post_comments').insert({
    post_id: postId,
    user_id: user.id,
    content
  })

  if (error) throw new Error('Erro ao comentar')

  return { success: true }
}
