'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFollowAction(targetUserId: string, pathToRevalidate?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilizador não autenticado')

    if (user.id === targetUserId) {
      throw new Error('Não podes seguir a ti próprio.')
    }

    // Check if already follows
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle()

    if (existingFollow) {
      // Unfollow
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('id', existingFollow.id)

      if (error) throw error
    } else {
      // Follow
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId
        })

      if (error) throw error
    }

    if (pathToRevalidate) {
      revalidatePath(pathToRevalidate)
    }

    return { success: true, isFollowing: !existingFollow }
  } catch (err: any) {
    console.error('Follow action error:', err)
    return { error: err.message || 'Ocorreu um erro ao seguir o utilizador.' }
  }
}
