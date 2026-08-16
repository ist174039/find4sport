'use server'

import { createClient as createClientServer } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getLimit, requireFeature } from '@/lib/billing/entitlements'
import { revalidatePath } from 'next/cache'

export async function joinCommunityAction(communityId: string) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Acesso negado. Sessão não encontrada.')

  const admin = createAdminClient()
  const { data: community } = await admin.from('communities').select('id').eq('id', communityId).maybeSingle()
  if (!community) throw new Error('Comunidade não encontrada.')

  const { error } = await admin.from('community_members').insert({ community_id: communityId, user_id: user.id, role: 'member' })
  if (error) {
    if (error.code === '23505') return { success: true, message: 'Já era membro desta comunidade.' }
    throw new Error(error.message || 'Erro ao aderir à comunidade.')
  }

  revalidatePath(`/comunidades/${communityId}`)
  return { success: true }
}

export async function createCommunityAction(formData: { name: string, description: string, privacy: string, city: string, modality: string }) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Precisa estar autenticado.')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('platform_users').select('type').eq('id', user.id).maybeSingle()
  if (profile?.type !== 'professional') throw new Error('Apenas profissionais podem criar comunidades.')

  await requireFeature(user.id, 'communities.create.enabled')
  const limit = await getLimit(user.id, 'communities.max')

  if (limit !== null) {
    const { count, error: countError } = await admin
      .from('community_members')
      .select('community_id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'admin')
    if (countError) throw countError
    if ((count ?? 0) >= limit) throw new Error(`Atingiu o limite de ${limit} comunidades do seu plano`)
  }

  const cleanName = formData.name.trim()
  if (!cleanName) throw new Error('O nome da comunidade é obrigatório.')
  const slugBase = cleanName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'comunidade'
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`

  const { data: newCommunity, error } = await admin
    .from('communities')
    .insert({ name: cleanName, slug, description: formData.description.trim() || null, is_private: formData.privacy === 'priv' })
    .select('id')
    .single()
  if (error || !newCommunity) throw new Error(error?.message || 'Erro ao criar comunidade.')

  const { error: memberError } = await admin.from('community_members').insert({ community_id: newCommunity.id, user_id: user.id, role: 'admin' })
  if (memberError) {
    await admin.from('communities').delete().eq('id', newCommunity.id)
    throw new Error('Não foi possível concluir a criação da comunidade.')
  }

  revalidatePath('/comunidades')
  return { success: true, id: newCommunity.id }
}
