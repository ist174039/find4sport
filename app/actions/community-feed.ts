'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCommunityPostAction(communityId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')

  const trimmedContent = content.trim()
  if (!communityId) throw new Error('Comunidade inválida.')
  if (!trimmedContent) throw new Error('A publicação não pode estar vazia.')
  if (trimmedContent.length > 5000) throw new Error('A publicação excede o limite de 5000 caracteres.')

  const admin = createAdminClient()
  const [{ data: member }, communityResult] = await Promise.all([
    admin.from('community_members').select('id, role').eq('community_id', communityId).eq('user_id', user.id).maybeSingle(),
    admin.from('communities').select('*').eq('id', communityId).maybeSingle(),
  ])
  const community = communityResult.data as any
  if (!community) throw new Error('Comunidade não encontrada.')
  if (!member) throw new Error('Apenas membros podem publicar nesta comunidade.')

  const policy = community.posting_policy || 'members'
  if (policy === 'reactions_only' && member.role !== 'admin') throw new Error('Nesta comunidade, os membros podem reagir às publicações, mas apenas administradores podem publicar.')
  if (policy === 'admin_only' && member.role !== 'admin') throw new Error('Apenas administradores podem publicar nesta comunidade.')

  const [{ data: professional }, { data: space }] = await Promise.all([
    admin.from('professionals').select('id').eq('user_id', user.id).maybeSingle(),
    admin.from('sport_spaces').select('id').eq('owner_user_id', user.id).limit(1).maybeSingle(),
  ])

  const { error } = await admin.from('posts').insert({
    user_id: user.id,
    professional_id: professional?.id || null,
    sport_space_id: space?.id || null,
    community_id: communityId,
    content: trimmedContent,
    media_url: null,
    media_type: null,
  })
  if (error) {
    console.error('Community post insert error:', error)
    throw new Error('Não foi possível publicar na comunidade.')
  }

  revalidatePath(`/comunidades/${communityId}`)
  return { success: true }
}
