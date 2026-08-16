'use server'

import { createAdminClient } from '@/lib/supabase/admin'

type PublicIdentity = {
  userId: string
  name: string
  avatar: string | null
  href: string
  type: 'user' | 'professional' | 'venue_manager'
}

export type PublicPostComment = {
  id: string
  content: string
  created_at: string | null
  identity: PublicIdentity
}

export type PublicPostLike = {
  id: string
  identity: PublicIdentity
}

async function resolveIdentities(userIds: string[]) {
  const admin = createAdminClient()
  const unique = [...new Set(userIds.filter(Boolean))]
  if (!unique.length) return new Map<string, PublicIdentity>()

  const [{ data: users }, { data: professionals }, { data: spaces }] = await Promise.all([
    admin.from('platform_users').select('id,full_name,avatar_url,type').in('id', unique),
    admin.from('professionals').select('user_id,public_slug,professional_name,full_name,avatar_url,status').in('user_id', unique),
    admin.from('sport_spaces').select('owner_user_id,slug,name,logo_url,status').in('owner_user_id', unique),
  ])

  const userMap = new Map((users || []).map(user => [user.id, user]))
  const professionalMap = new Map((professionals || []).filter(item => item.status === 'active').map(item => [item.user_id, item]))
  const spaceMap = new Map((spaces || []).filter(item => item.status === 'active').map(item => [item.owner_user_id, item]))
  const identities = new Map<string, PublicIdentity>()

  for (const userId of unique) {
    const user = userMap.get(userId)
    const professional = professionalMap.get(userId)
    const space = spaceMap.get(userId)

    if (professional) {
      identities.set(userId, {
        userId,
        name: professional.professional_name || professional.full_name || user?.full_name || 'Profissional',
        avatar: professional.avatar_url || user?.avatar_url || null,
        href: `/profissionais/${professional.public_slug || userId}`,
        type: 'professional',
      })
      continue
    }

    if (space) {
      identities.set(userId, {
        userId,
        name: space.name || user?.full_name || 'Espaço',
        avatar: space.logo_url || user?.avatar_url || null,
        href: `/espacos/${space.slug || userId}`,
        type: 'venue_manager',
      })
      continue
    }

    identities.set(userId, {
      userId,
      name: user?.full_name || 'Utilizador',
      avatar: user?.avatar_url || null,
      href: `/utilizadores/${userId}`,
      type: 'user',
    })
  }

  return identities
}

export async function loadPostCommentsAction(postId: string): Promise<PublicPostComment[]> {
  if (!postId) return []
  const admin = createAdminClient()
  const { data: comments, error } = await admin.from('post_comments').select('id,user_id,content,created_at').eq('post_id', postId).order('created_at', { ascending: true }).limit(200)
  if (error) {
    console.error('Load post comments error:', error)
    throw new Error('Não foi possível carregar os comentários.')
  }
  const identities = await resolveIdentities((comments || []).map(item => item.user_id))
  return (comments || []).map(item => ({
    id: item.id,
    content: item.content,
    created_at: item.created_at,
    identity: identities.get(item.user_id) || { userId: item.user_id, name: 'Utilizador', avatar: null, href: `/utilizadores/${item.user_id}`, type: 'user' },
  }))
}

export async function loadPostLikesAction(postId: string): Promise<PublicPostLike[]> {
  if (!postId) return []
  const admin = createAdminClient()
  const { data: likes, error } = await admin.from('post_likes').select('id,user_id').eq('post_id', postId).limit(500)
  if (error) {
    console.error('Load post likes error:', error)
    throw new Error('Não foi possível carregar os gostos.')
  }
  const identities = await resolveIdentities((likes || []).map(item => item.user_id))
  return (likes || []).map(item => ({
    id: item.id,
    identity: identities.get(item.user_id) || { userId: item.user_id, name: 'Utilizador', avatar: null, href: `/utilizadores/${item.user_id}`, type: 'user' },
  }))
}
