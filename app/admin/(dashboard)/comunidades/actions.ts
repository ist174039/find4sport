'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminPermission } from '@/lib/auth/authorization'

function requireReason(formData: FormData) {
  const reason = String(formData.get('reason') || '').trim().slice(0, 500)
  if (reason.length < 5) throw new Error('Indica um motivo com pelo menos 5 caracteres.')
  return reason
}

async function writeAudit(admin: Awaited<ReturnType<typeof requireAdminPermission>>['admin'], userId: string, email: string | undefined, communityId: string, action: string, reason: string, data: Record<string, unknown>) {
  const { error } = await admin.from('audit_logs').insert({
    user_id: userId,
    user_email: email || null,
    action,
    table_name: 'communities',
    record_id: communityId,
    new_data: { reason, ...data },
  })
  if (error) throw new Error('A alteração foi aplicada, mas não foi possível registar a auditoria.')
}

function revalidateCommunity(communityId: string) {
  revalidatePath('/admin/comunidades')
  revalidatePath(`/admin/comunidades/${communityId}`)
  revalidatePath('/comunidades')
}

export async function reviewAdminCommunityRequestAction(communityId: string, requestId: string, decision: 'approved' | 'rejected', formData: FormData) {
  const reason = requireReason(formData)
  const { user, admin } = await requireAdminPermission('communities.manage')
  const { data: request, error: requestError } = await admin.from('community_join_requests').select('id,user_id,status').eq('id', requestId).eq('community_id', communityId).maybeSingle()
  if (requestError || !request || request.status !== 'pending') throw new Error('Pedido pendente não encontrado.')
  if (decision === 'approved') {
    const { error: memberError } = await admin.from('community_members').upsert({ community_id: communityId, user_id: request.user_id, role: 'member' }, { onConflict: 'community_id,user_id' })
    if (memberError) throw new Error('Não foi possível adicionar o membro.')
  }
  const { error } = await admin.from('community_join_requests').update({ status: decision, reviewed_by: user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', request.id).eq('status', 'pending')
  if (error) throw new Error('Não foi possível concluir o pedido.')
  await writeAudit(admin, user.id, user.email, communityId, `community.join_request.${decision}`, reason, { request_id: request.id, member_user_id: request.user_id })
  revalidateCommunity(communityId)
}

export async function setAdminCommunityMemberRoleAction(communityId: string, memberUserId: string, role: 'admin' | 'member', formData: FormData) {
  const reason = requireReason(formData)
  const { user, admin } = await requireAdminPermission('communities.manage')
  const { data: target } = await admin.from('community_members').select('id,role').eq('community_id', communityId).eq('user_id', memberUserId).maybeSingle()
  if (!target) throw new Error('Membro não encontrado.')
  if (target.role === 'admin' && role === 'member') {
    const { count } = await admin.from('community_members').select('id', { count: 'exact', head: true }).eq('community_id', communityId).eq('role', 'admin')
    if ((count || 0) <= 1) throw new Error('A comunidade tem de manter pelo menos um administrador.')
  }
  const { error } = await admin.from('community_members').update({ role }).eq('id', target.id)
  if (error) throw new Error('Não foi possível alterar a função do membro.')
  await writeAudit(admin, user.id, user.email, communityId, 'community.member.role_changed', reason, { member_user_id: memberUserId, old_role: target.role, new_role: role })
  revalidateCommunity(communityId)
}

export async function transferCommunityOwnershipAction(communityId: string, formData: FormData) {
  const reason = requireReason(formData)
  const newOwnerId = String(formData.get('new_owner_id') || '')
  if (!newOwnerId) throw new Error('Seleciona o novo responsável.')
  const { user, admin } = await requireAdminPermission('communities.manage')
  const { data: community } = await admin.from('communities').select('created_by').eq('id', communityId).maybeSingle()
  const { data: member } = await admin.from('community_members').select('id,role').eq('community_id', communityId).eq('user_id', newOwnerId).maybeSingle()
  if (!community || !member) throw new Error('A comunidade ou o novo responsável não foi encontrado.')
  const { error: memberError } = await admin.from('community_members').update({ role: 'admin' }).eq('id', member.id)
  if (memberError) throw new Error('Não foi possível atribuir administração ao novo responsável.')
  const { error } = await admin.from('communities').update({ created_by: newOwnerId }).eq('id', communityId)
  if (error) throw new Error('Não foi possível transferir a responsabilidade.')
  await writeAudit(admin, user.id, user.email, communityId, 'community.ownership.transferred', reason, { old_owner_id: community.created_by, new_owner_id: newOwnerId })
  revalidateCommunity(communityId)
}

export async function setAdminCommunityStatusAction(communityId: string, status: 'active' | 'inactive', formData: FormData) {
  const reason = requireReason(formData)
  const { user, admin } = await requireAdminPermission('communities.manage')
  const { data: community } = await admin.from('communities').select('id,status').eq('id', communityId).maybeSingle()
  if (!community) throw new Error('Comunidade não encontrada.')
  const { error } = await admin.from('communities').update({ status, updated_at: new Date().toISOString() }).eq('id', communityId)
  if (error) throw new Error('Não foi possível alterar o estado da comunidade.')
  await writeAudit(admin, user.id, user.email, communityId, `community.${status === 'active' ? 'reactivated' : 'deactivated'}`, reason, { old_status: community.status, new_status: status })
  revalidateCommunity(communityId)
}

export async function deleteAdminCommunityAction(communityId: string, formData: FormData) {
  const reason = requireReason(formData)
  const { user, admin } = await requireAdminPermission('communities.manage')
  const { data: community } = await admin.from('communities').select('id,name').eq('id', communityId).maybeSingle()
  if (!community) throw new Error('Comunidade não encontrada.')
  const { error } = await admin.from('communities').delete().eq('id', communityId)
  if (error) throw new Error(`Não foi possível apagar a comunidade: ${error.message}`)
  await writeAudit(admin, user.id, user.email, communityId, 'community.deleted', reason, { name: community.name })
  revalidatePath('/admin/comunidades'); revalidatePath('/comunidades')
  redirect('/admin/comunidades')
}
