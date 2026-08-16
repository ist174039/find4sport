'use server'

import { createClient as createClientServer } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveEntitlement, getLimit } from '@/lib/billing/entitlements'
import { revalidatePath } from 'next/cache'

export async function joinCommunityAction(communityId: string) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Acesso negado. Sessão não encontrada.')
  const admin = createAdminClient()
  const { data: community } = await admin.from('communities').select('id, is_private').eq('id', communityId).maybeSingle()
  if (!community) throw new Error('Comunidade não encontrada.')
  const { data: existingMember } = await admin.from('community_members').select('id').eq('community_id', communityId).eq('user_id', user.id).maybeSingle()
  if (existingMember) return { success: true, status: 'member' as const }

  if (community.is_private) {
    const { data: existingRequest } = await admin.from('community_join_requests').select('id, status').eq('community_id', communityId).eq('user_id', user.id).maybeSingle()
    if (existingRequest?.status === 'pending') return { success: true, status: 'pending' as const }
    if (existingRequest) {
      const { error } = await admin.from('community_join_requests').update({ status: 'pending', reviewed_by: null, reviewed_at: null, updated_at: new Date().toISOString() }).eq('id', existingRequest.id)
      if (error) throw new Error('Não foi possível renovar o pedido de adesão.')
    } else {
      const { error } = await admin.from('community_join_requests').insert({ community_id: communityId, user_id: user.id, status: 'pending' })
      if (error) throw new Error('Não foi possível enviar o pedido de adesão.')
    }
    revalidatePath(`/comunidades/${communityId}`)
    return { success: true, status: 'pending' as const }
  }

  const { error } = await admin.from('community_members').insert({ community_id: communityId, user_id: user.id, role: 'member' })
  if (error && error.code !== '23505') throw new Error(error.message || 'Erro ao aderir à comunidade.')
  revalidatePath(`/comunidades/${communityId}`)
  return { success: true, status: 'member' as const }
}

export async function leaveCommunityAction(communityId: string) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Precisa estar autenticado.')
  const admin = createAdminClient()
  const { data: membership } = await admin.from('community_members').select('id, role').eq('community_id', communityId).eq('user_id', user.id).maybeSingle()
  if (!membership) return { success: true }
  if (membership.role === 'admin') {
    const { count } = await admin.from('community_members').select('id', { count: 'exact', head: true }).eq('community_id', communityId).eq('role', 'admin')
    if ((count || 0) <= 1) throw new Error('Antes de sair, atribua a administração da comunidade a outro membro.')
  }
  const { error } = await admin.from('community_members').delete().eq('id', membership.id)
  if (error) throw new Error('Não foi possível sair da comunidade.')
  revalidatePath(`/comunidades/${communityId}`)
  revalidatePath('/comunidades')
  return { success: true }
}

export async function reviewCommunityJoinRequestAction(requestId: string, decision: 'approve' | 'reject') {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Acesso negado. Sessão não encontrada.')
  const admin = createAdminClient()
  const { data: request } = await admin.from('community_join_requests').select('id, community_id, user_id, status').eq('id', requestId).maybeSingle()
  if (!request) throw new Error('Pedido não encontrado.')
  const { data: membership } = await admin.from('community_members').select('id').eq('community_id', request.community_id).eq('user_id', user.id).eq('role', 'admin').maybeSingle()
  if (!membership) throw new Error('Sem permissões para gerir esta comunidade.')
  if (decision === 'approve') {
    const { error: memberError } = await admin.from('community_members').upsert({ community_id: request.community_id, user_id: request.user_id, role: 'member' }, { onConflict: 'community_id,user_id' })
    if (memberError) throw new Error('Não foi possível adicionar o membro.')
  }
  const { error } = await admin.from('community_join_requests').update({ status: decision === 'approve' ? 'approved' : 'rejected', reviewed_by: user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', request.id)
  if (error) throw new Error('Não foi possível concluir a decisão.')
  revalidatePath(`/comunidades/${request.community_id}`)
  return { success: true }
}

export async function createCommunityAction(formData: { name: string; description: string; privacy: string; city: string; modality: string; postingPolicy?: 'members' | 'reactions_only' | 'admin_only' }) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Precisa estar autenticado.')
  const admin = createAdminClient()
  const { data: profile, error: profileError } = await admin.from('platform_users').select('type').eq('id', user.id).maybeSingle()
  if (profileError) throw new Error('Não foi possível validar o seu perfil.')
  if (profile?.type !== 'professional') throw new Error('Apenas profissionais podem criar comunidades.')

  const createEntitlement = await getEffectiveEntitlement(user.id, 'communities.create.enabled')
  if (createEntitlement && !createEntitlement.unlimited && createEntitlement.valueType === 'boolean' && createEntitlement.value !== true) {
    throw new Error('O teu plano atual não permite criar comunidades. Atualiza para Pro ou Premium em Faturação.')
  }

  const maxEntitlement = await getEffectiveEntitlement(user.id, 'communities.max')
  if (maxEntitlement) {
    const limit = await getLimit(user.id, 'communities.max')
    if (limit !== null) {
      const { count, error: countError } = await admin.from('community_members').select('community_id', { count: 'exact', head: true }).eq('user_id', user.id).eq('role', 'admin')
      if (countError) throw new Error('Não foi possível validar o limite de comunidades do teu plano.')
      if ((count ?? 0) >= limit) throw new Error(`Atingiste o limite de ${limit} comunidades do teu plano.`)
    }
  }

  const cleanName = String(formData.name || '').trim()
  const description = String(formData.description || '').trim()
  if (cleanName.length < 3) throw new Error('O nome da comunidade deve ter pelo menos 3 caracteres.')
  if (description.length < 10) throw new Error('A descrição deve ter pelo menos 10 caracteres.')

  const slugBase = cleanName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'comunidade'
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`
  const policy = ['members', 'reactions_only', 'admin_only'].includes(String(formData.postingPolicy)) ? formData.postingPolicy : 'members'

  const requiredPayload: Record<string, any> = { name: cleanName, slug, description, is_private: formData.privacy === 'priv', created_by: user.id }
  const optionalPayload: Record<string, any> = { sport_category: String(formData.modality || '').trim() || null, location: String(formData.city || '').trim() || null, posting_policy: policy }

  let newCommunity: any = null
  let error: any = null
  ;({ data: newCommunity, error } = await admin.from('communities').insert({ ...requiredPayload, ...optionalPayload }).select('id').single())
  if (error && (error.code === '42703' || /column .* does not exist/i.test(error.message || ''))) {
    ;({ data: newCommunity, error } = await admin.from('communities').insert({ ...requiredPayload, sport_category: optionalPayload.sport_category }).select('id').single())
  }
  if (error || !newCommunity) throw new Error(error?.message || 'Erro ao criar comunidade.')

  const { error: memberError } = await admin.from('community_members').insert({ community_id: newCommunity.id, user_id: user.id, role: 'admin' })
  if (memberError) {
    await admin.from('communities').delete().eq('id', newCommunity.id)
    throw new Error('A comunidade foi criada, mas não foi possível atribuir o administrador. A operação foi revertida.')
  }

  revalidatePath('/comunidades')
  revalidatePath(`/comunidades/${newCommunity.id}`)
  return { success: true, id: newCommunity.id }
}
