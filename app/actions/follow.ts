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

// Enrich a list of platform_user IDs with their profile info (professional or space)
async function enrichUserIds(supabase: any, userIds: string[]) {
  if (userIds.length === 0) return []

  const [profsResult, spacesResult] = await Promise.all([
    supabase
      .from('professionals')
      .select('id, user_id, full_name, avatar_url, public_slug, is_verified')
      .in('user_id', userIds),
    supabase
      .from('sport_spaces')
      .select('id, owner_user_id, name, logo_url, slug, is_verified')
      .in('owner_user_id', userIds)
  ])

  const profByUserId: Record<string, any> = {}
  for (const p of profsResult.data || []) {
    profByUserId[p.user_id] = { ...p, _type: 'professional' }
  }

  const spaceByUserId: Record<string, any> = {}
  for (const s of spacesResult.data || []) {
    spaceByUserId[s.owner_user_id] = { ...s, _type: 'space' }
  }

  return userIds.map(uid => {
    if (profByUserId[uid]) {
      const p = profByUserId[uid]
      return {
        userId: uid,
        type: 'professional' as const,
        name: p.full_name,
        avatar: p.avatar_url,
        isVerified: p.is_verified,
        href: `/profissionais/${p.public_slug || p.id}`
      }
    }
    if (spaceByUserId[uid]) {
      const s = spaceByUserId[uid]
      return {
        userId: uid,
        type: 'space' as const,
        name: s.name,
        avatar: s.logo_url,
        isVerified: s.is_verified,
        href: `/espacos/${s.slug || s.id}`
      }
    }
    return null
  }).filter(Boolean)
}

// Returns the list of people/spaces that targetUserId is following
export async function getFollowingList(targetUserId: string) {
  try {
    const supabase = await createClient()

    const { data: follows } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', targetUserId)

    const ids = (follows || []).map((f: any) => f.following_id)
    const list = await enrichUserIds(supabase, ids)

    // Also check if current logged-in user follows each of them
    const { data: { user } } = await supabase.auth.getUser()
    let myFollowingIds: string[] = []
    if (user) {
      const { data: myFollows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)
      myFollowingIds = (myFollows || []).map((f: any) => f.following_id)
    }

    return {
      success: true,
      list: (list as any[]).map(item => ({
        ...item,
        isFollowedByMe: myFollowingIds.includes(item.userId)
      })),
      currentUserId: user?.id || null
    }
  } catch (err: any) {
    return { error: err.message, list: [], currentUserId: null }
  }
}

// Returns the list of people/spaces that follow targetUserId
export async function getFollowersList(targetUserId: string) {
  try {
    const supabase = await createClient()

    const { data: follows } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('following_id', targetUserId)

    const ids = (follows || []).map((f: any) => f.follower_id)
    const list = await enrichUserIds(supabase, ids)

    // Also check if current logged-in user follows each of them
    const { data: { user } } = await supabase.auth.getUser()
    let myFollowingIds: string[] = []
    if (user) {
      const { data: myFollows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)
      myFollowingIds = (myFollows || []).map((f: any) => f.following_id)
    }

    return {
      success: true,
      list: (list as any[]).map(item => ({
        ...item,
        isFollowedByMe: myFollowingIds.includes(item.userId)
      })),
      currentUserId: user?.id || null
    }
  } catch (err: any) {
    return { error: err.message, list: [], currentUserId: null }
  }
}
