'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/authorization'
import { writeAdminAudit } from '@/lib/admin/audit'

export async function decideSpaceClaimAction(claimId: string, decision: 'approved' | 'rejected', decisionReason: string) {
  const { user, admin } = await requireAdmin()
  if (!claimId) throw new Error('Reivindicação inválida.')

  const { data: claim, error: claimError } = await admin
    .from('space_claims')
    .select('id,space_id,user_id,status,message,documents_url')
    .eq('id', claimId)
    .maybeSingle()
  if (claimError || !claim) throw new Error('Reivindicação não encontrada.')
  if (claim.status !== 'pending') throw new Error('Esta reivindicação já foi decidida.')
  if (!claim.space_id || !claim.user_id) throw new Error('A reivindicação não tem espaço ou requerente válido associado.')
  const reason = decisionReason.trim()
  if (reason.length < 10) throw new Error('Indique uma justificação com pelo menos 10 caracteres.')

  const spaceId = claim.space_id
  const claimantUserId = claim.user_id

  if (decision === 'approved') {
    const [{ data: space }, { data: claimant }] = await Promise.all([
      admin.from('sport_spaces').select('id,name,owner_user_id').eq('id', spaceId).maybeSingle(),
      admin.from('platform_users').select('id,type').eq('id', claimantUserId).maybeSingle(),
    ])
    if (!space) throw new Error('Espaço não encontrado.')
    if (space.owner_user_id && space.owner_user_id !== claimantUserId) throw new Error('O espaço já foi atribuído a outro gestor.')
    if (claimant?.type !== 'venue_manager') throw new Error('O requerente não possui uma conta de gestor de espaço.')

    const { error: ownerError } = await admin.from('sport_spaces').update({ owner_user_id: claimantUserId, is_verified: true }).eq('id', spaceId).is('owner_user_id', null)
    if (ownerError) throw new Error('Não foi possível atribuir o espaço.')

    const { error: statusError } = await (admin as any).from('space_claims').update({ status: 'approved', decision_reason: reason }).eq('id', claimId).eq('status', 'pending')
    if (statusError) {
      await admin.from('sport_spaces').update({ owner_user_id: null, is_verified: false }).eq('id', spaceId).eq('owner_user_id', claimantUserId)
      throw new Error('A atribuição foi revertida porque não foi possível concluir o pedido.')
    }

    await admin.from('space_claims').update({ status: 'rejected' }).eq('space_id', spaceId).eq('status', 'pending').neq('id', claimId)
  } else {
    const { error } = await (admin as any).from('space_claims').update({ status: 'rejected', decision_reason: reason }).eq('id', claimId).eq('status', 'pending')
    if (error) throw new Error('Não foi possível rejeitar a reivindicação.')
  }

  await writeAdminAudit(admin as any, {
    action: 'UPDATE',
    tableName: 'space_claims',
    userEmail: user.email || 'admin',
    message: `Reivindicação ${claimId} ${decision === 'approved' ? 'aprovada' : 'rejeitada'}`,
    data: { claim_id: claimId, space_id: spaceId, claimant_user_id: claimantUserId, decision },
  })

  revalidatePath('/admin/reivindicacoes')
  revalidatePath('/admin')
  revalidatePath('/dashboard/espaco')
  return { success: true, status: decision }
}
