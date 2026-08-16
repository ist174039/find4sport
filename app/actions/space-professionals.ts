'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Mode = 'professional' | 'space'

async function requireParty(mode: Mode, targetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária.')
  const admin = createAdminClient()
  if (mode === 'professional') {
    const { data } = await admin.from('professionals').select('id').eq('id', targetId).eq('user_id', user.id).maybeSingle()
    if (!data) throw new Error('Sem permissão para gerir este perfil profissional.')
  } else {
    const { data } = await admin.from('sport_spaces').select('id').eq('id', targetId).or(`owner_user_id.eq.${user.id},created_by.eq.${user.id}`).maybeSingle()
    if (!data) throw new Error('Sem permissão para gerir este espaço.')
  }
  return admin
}

function refresh() {
  revalidatePath('/dashboard/perfil')
  revalidatePath('/dashboard/espaco')
}

export async function listSpaceProfessionalLinksAction(mode: Mode, targetId: string) {
  const admin = await requireParty(mode, targetId)
  let query = admin.from('space_professionals').select('id, space_id, professional_id, status, initiated_by, space:sport_spaces(id,name,slug), professional:professionals(id,full_name,professional_name,public_slug)')
  query = mode === 'professional' ? query.eq('professional_id', targetId) : query.eq('space_id', targetId)
  const { data, error } = await query
  if (error) throw new Error('Não foi possível carregar associações.')
  return data || []
}

export async function searchSpaceProfessionalTargetsAction(mode: Mode, targetId: string, raw: string) {
  const admin = await requireParty(mode, targetId)
  const q = raw.trim()
  if (q.length < 2) return []
  if (mode === 'professional') {
    const { data, error } = await admin.from('sport_spaces').select('id,name,address,is_verified,status').ilike('name', `%${q}%`).limit(10)
    if (error) throw new Error('Não foi possível pesquisar espaços.')
    return (data || []).filter((x: any) => x.is_verified || x.status === 'active').map((x: any) => ({ id: x.id, name: x.name, subtitle: x.address || 'Espaço desportivo' }))
  }
  const { data, error } = await admin.from('professionals').select('id,full_name,professional_name,is_verified').or(`full_name.ilike.%${q}%,professional_name.ilike.%${q}%`).limit(10)
  if (error) throw new Error('Não foi possível pesquisar profissionais.')
  return (data || []).filter((x: any) => x.is_verified !== false).map((x: any) => ({ id: x.id, name: x.professional_name || x.full_name || 'Profissional', subtitle: x.full_name || 'Profissional' }))
}

export async function requestSpaceProfessionalLinkAction(mode: Mode, targetId: string, otherId: string) {
  const admin = await requireParty(mode, targetId)
  const spaceId = mode === 'professional' ? otherId : targetId
  const professionalId = mode === 'professional' ? targetId : otherId
  const { data: existing } = await admin.from('space_professionals').select('id,status').eq('space_id', spaceId).eq('professional_id', professionalId).maybeSingle()
  if (existing?.status === 'active') throw new Error('Esta associação já está ativa.')
  if (existing?.status === 'pending') throw new Error('Já existe um pedido pendente.')
  const result = existing
    ? await admin.from('space_professionals').update({ status: 'pending', initiated_by: mode, updated_at: new Date().toISOString() }).eq('id', existing.id)
    : await admin.from('space_professionals').insert({ space_id: spaceId, professional_id: professionalId, status: 'pending', initiated_by: mode })
  if (result.error) throw new Error('Não foi possível enviar o pedido de associação.')
  refresh()
  return { success: true }
}

export async function decideSpaceProfessionalLinkAction(mode: Mode, targetId: string, linkId: string, decision: 'active' | 'rejected') {
  const admin = await requireParty(mode, targetId)
  const { data: link } = await admin.from('space_professionals').select('*').eq('id', linkId).maybeSingle()
  if (!link) throw new Error('Associação não encontrada.')
  const belongs = mode === 'professional' ? link.professional_id === targetId : link.space_id === targetId
  if (!belongs || link.initiated_by === mode || link.status !== 'pending') throw new Error('Este pedido não pode ser processado por esta entidade.')
  const { error } = await admin.from('space_professionals').update({ status: decision, updated_at: new Date().toISOString() }).eq('id', linkId)
  if (error) throw new Error('Não foi possível atualizar a associação.')
  refresh()
  return { success: true }
}

export async function removeSpaceProfessionalLinkAction(mode: Mode, targetId: string, linkId: string) {
  const admin = await requireParty(mode, targetId)
  const { data: link } = await admin.from('space_professionals').select('id,space_id,professional_id').eq('id', linkId).maybeSingle()
  if (!link) return { success: true }
  const belongs = mode === 'professional' ? link.professional_id === targetId : link.space_id === targetId
  if (!belongs) throw new Error('Esta associação não pertence à entidade selecionada.')
  const { error } = await admin.from('space_professionals').delete().eq('id', linkId)
  if (error) throw new Error('Não foi possível remover a associação.')
  refresh()
  return { success: true }
}
