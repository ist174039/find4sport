'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveEntitlement, getLimit } from '@/lib/billing/entitlements'
import { revalidatePath } from 'next/cache'

type CreateCommunityInput = {
  name: string
  description: string
  privacy: string
  city: string
  categoryId: string
  postingPolicy?: 'members' | 'reactions_only' | 'admin_only'
}

export async function createCommunityAction(input: CreateCommunityInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Precisa estar autenticado.')
  const admin = createAdminClient()

  const { data: profile, error: profileError } = await admin.from('platform_users').select('type').eq('id', user.id).maybeSingle()
  if (profileError) throw new Error('Não foi possível validar o seu perfil.')
  if (profile?.type !== 'professional') throw new Error('Apenas profissionais podem criar comunidades.')

  const createEntitlement = await getEffectiveEntitlement(user.id, 'communities.create.enabled')
  if (createEntitlement && !createEntitlement.unlimited && createEntitlement.valueType === 'boolean' && createEntitlement.value !== true) throw new Error('O teu plano atual não permite criar comunidades. Atualiza para Pro ou Premium em Faturação.')
  const maxEntitlement = await getEffectiveEntitlement(user.id, 'communities.max')
  if (maxEntitlement) {
    const limit = await getLimit(user.id, 'communities.max')
    if (limit !== null) {
      const { count, error } = await admin.from('community_members').select('community_id', { count: 'exact', head: true }).eq('user_id', user.id).eq('role', 'admin')
      if (error) throw new Error('Não foi possível validar o limite de comunidades do teu plano.')
      if ((count ?? 0) >= limit) throw new Error(`Atingiste o limite de ${limit} comunidades do teu plano.`)
    }
  }

  const cleanName = String(input.name || '').trim()
  const description = String(input.description || '').trim()
  const location = String(input.city || '').trim().slice(0, 180) || null
  if (cleanName.length < 3 || cleanName.length > 160) throw new Error('O nome da comunidade deve ter entre 3 e 160 caracteres.')
  if (description.length < 10 || description.length > 5000) throw new Error('A descrição deve ter entre 10 e 5000 caracteres.')
  if (!input.categoryId) throw new Error('Seleciona uma modalidade.')

  const { data: category, error: categoryError } = await admin.from('categories').select('id,name,slug').eq('id', input.categoryId).maybeSingle()
  if (categoryError || !category) throw new Error('A modalidade selecionada já não está disponível.')

  const policy = ['members', 'reactions_only', 'admin_only'].includes(String(input.postingPolicy)) ? input.postingPolicy! : 'members'
  const slugBase = cleanName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'comunidade'
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`
  const requiredPayload = { name: cleanName, slug, description, is_private: input.privacy === 'priv', created_by: user.id, sport_category: category.name }

  let created: { id: string } | null = null
  let createError: { code?: string; message?: string } | null = null
  ;({ data: created, error: createError } = await admin.from('communities').insert({ ...requiredPayload, location, posting_policy: policy }).select('id').single())
  if (createError && (createError.code === '42703' || /column .* does not exist/i.test(createError.message || ''))) {
    ;({ data: created, error: createError } = await admin.from('communities').insert(requiredPayload).select('id').single())
  }
  if (createError || !created) throw new Error(createError?.message || 'Erro ao criar comunidade.')

  const { error: memberError } = await admin.from('community_members').insert({ community_id: created.id, user_id: user.id, role: 'admin' })
  if (memberError) {
    await admin.from('communities').delete().eq('id', created.id)
    throw new Error('A comunidade foi criada, mas não foi possível atribuir o administrador. A operação foi revertida.')
  }

  // Forward-compatible normalization: after the taxonomy migration exists, persist the
  // canonical relation as well. Older databases keep working through sport_category.
  const relationClient = admin as unknown as { from: (table: string) => { insert: (payload: unknown) => Promise<{ error: { code?: string; message?: string } | null }> } }
  const relation = await relationClient.from('community_categories').insert({ community_id: created.id, category_id: category.id })
  if (relation.error && !['42P01', '42703'].includes(relation.error.code || '')) {
    await admin.from('community_members').delete().eq('community_id', created.id).eq('user_id', user.id)
    await admin.from('communities').delete().eq('id', created.id)
    throw new Error('Não foi possível associar a modalidade à comunidade. A operação foi revertida.')
  }

  revalidatePath('/comunidades')
  revalidatePath('/dashboard/comunidades')
  revalidatePath(`/comunidades/${created.id}`)
  return { success: true, id: created.id }
}
