'use server'

import { createClient } from '@/lib/supabase/server'
import { isPlatformRole, type PlatformRole } from '@/lib/auth/roles'
import { revalidatePath } from 'next/cache'

export async function toggleFollowAction(targetUserId: string, pathToRevalidate?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilizador não autenticado')
    if (user.id === targetUserId) throw new Error('Não podes seguir a ti próprio.')

    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle()

    if (existingFollow) {
      const { error } = await supabase.from('user_follows').delete().eq('id', existingFollow.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('user_follows').insert({
        follower_id: user.id,
        following_id: targetUserId,
      })
      if (error) throw error
    }

    if (pathToRevalidate) revalidatePath(pathToRevalidate)
    return { success: true, isFollowing: !existingFollow }
  } catch (err: any) {
    console.error('Follow action error:', err)
    return { error: err.message || 'Ocorreu um erro ao seguir o utilizador.' }
  }
}

type EnrichedFollowUser = {
  userId: string
  type: PlatformRole
  name: string
  avatar: string | null
  isVerified: boolean | null
  href: string
}

async function enrichUserIds(supabase: any, userIds: string[]): Promise<EnrichedFollowUser[]> {
  if (userIds.length === 0) return []

  const [usersResult, profsResult, spacesResult] = await Promise.all([
    supabase
      .from('platform_users')
      .select('id, full_name, avatar_url, type')
      .in('id', userIds),
    supabase
      .from('professionals')
      .select('id, user_id, full_name, avatar_url, public_slug, is_verified')
      .in('user_id', userIds),
    supabase
      .from('sport_spaces')
      .select('id, owner_user_id, name, logo_url, slug, is_verified')
      .in('owner_user_id', userIds),
  ])

  const profByUserId = new Map((profsResult.data || []).map((p: any) => [p.user_id, p]))
  const spaceByUserId = new Map((spacesResult.data || []).map((s: any) => [s.owner_user_id, s]))
  const userByUserId = new Map((usersResult.data || []).map((u: any) => [u.id, u]))

  return userIds.flatMap((uid) => {
    const profile = userByUserId.get(uid) as any
    if (!profile || !isPlatformRole(profile.type)) return []

    if (profile.type === 'professional') {
      const professional = profByUserId.get(uid) as any
      if (!professional) return []
      return [{
        userId: uid,
        type: 'professional' as const,
        name: professional.full_name || profile.full_name || 'Profissional',
        avatar: professional.avatar_url || profile.avatar_url || null,
        isVerified: professional.is_verified ?? false,
        href: `/profissionais/${professional.public_slug || professional.id}`,
      }]
    }

    if (profile.type === 'venue_manager') {
      const space = spaceByUserId.get(uid) as any
      if (!space) return []
      return [{
        userId: uid,
        type: 'venue_manager' as const,
        name: space.name || profile.full_name || 'Espaço',
        avatar: space.logo_url || profile.avatar_url || null,
        isVerified: space.is_verified ?? false,
        href: `/espacos/${space.slug || space.id}`,
      }]
    }

    return [{
      userId: uid,
      type: 'athlete' as const,
      name: profile.full_name || 'Utilizador',
      avatar: profile.avatar_url || null,
      isVerified: false,
      href: `/utilizadores/${uid}`,
    }]
  })
}

async function getMyFollowingIds(supabase: any, userId: string | undefined) {
  if (!userId) return [] as string[]
  const { data } = await supabase
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', userId)
  return (data || []).map((f: any) => f.following_id)
}

export async function getFollowingList(targetUserId: string) {
  try {
    const supabase = await createClient()
    const { data: follows } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', targetUserId)

    const ids = (follows || []).map((f: any) => f.following_id)
    const list = await enrichUserIds(supabase, ids)
    const { data: { user } } = await supabase.auth.getUser()
    const myFollowingIds = await getMyFollowingIds(supabase, user?.id)

    return {
      success: true,
      list: list.map((item) => ({ ...item, isFollowedByMe: myFollowingIds.includes(item.userId) })),
      currentUserId: user?.id || null,
    }
  } catch (err: any) {
    return { error: err.message, list: [], currentUserId: null }
  }
}

export async function getFollowersList(targetUserId: string) {
  try {
    const supabase = await createClient()
    const { data: follows } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('following_id', targetUserId)

    const ids = (follows || []).map((f: any) => f.follower_id)
    const list = await enrichUserIds(supabase, ids)
    const { data: { user } } = await supabase.auth.getUser()
    const myFollowingIds = await getMyFollowingIds(supabase, user?.id)

    return {
      success: true,
      list: list.map((item) => ({ ...item, isFollowedByMe: myFollowingIds.includes(item.userId) })),
      currentUserId: user?.id || null,
    }
  } catch (err: any) {
    return { error: err.message, list: [], currentUserId: null }
  }
}
