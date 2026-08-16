'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { writeAdminAudit } from '@/lib/admin/audit'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária.')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) throw new Error('Sem permissões de administração.')
  return { user, admin: createAdminClient() }
}

export async function decideSpaceClaimAction(claimId: string, decision: 'approved' | 'rejected') {
  const { user, admin } = await requireAdmin()
  if (!claimId) throw new Error('Reivindicação inválida.')

  const { data: claim, error: claimError } = await admin
    .from('space_claims')
    .select('id,space_id,user_id,status,message,documents_url')
    .eq('id', claimId)
    .maybeSingle()
  if (claimError || !claim) throw new Error('Reivindicação não encontrada.')
  if (claim.status !== 'pending') throw new Error('Esta reivindicação já foi decidida.')

  if (decision === 'approved') {
    const [{ data: space }, { data: claimant }] = await Promise.all([
      admin.from('sport_spaces').select('id,name,owner_user_id').eq('id', claim.space_id).maybeSingle(),
      admin.from('platform_users').select('id,type').eq('id', claim.user_id).maybeSingle(),
    ])
    if (!space) throw new Error('Espaço não encontrado.')
    if (space.owner_user_id && space.owner_user_id !== claim.user_id) throw new Error('O espaço já foi atribuído a outro gestor.')
    if (claimant?.type !== 'venue_manager') throw new Error('O requerente não possui uma conta de gestor de espaço.')

    const { error: ownerError } = await admin.from('sport_spaces').update({ owner_user_id: claim.user_id, is_verified: true }).eq('id', claim.space_id).is('owner_user_id', null)
    if (ownerError) throw new Error('Não foi possível atribuir o espaço.')

    const { error: statusError } = await admin.from('space_claims').update({ status: 'approved' }).eq('id', claimId).eq('status', 'pending')
    if (statusError) {
      await admin.from('sport_spaces').update({ owner_user_id: null, is_verified: false }).eq('id', claim.space_id).eq('owner_user_id', claim.user_id)
      throw new Error('A atribuição foi revertida porque não foi possível concluir o pedido.')
    }

    await admin.from('space_claims').update({ status: 'rejected' }).eq('space_id', claim.space_id).eq('status', 'pending').neq('id', claimId)
  } else {
    const { error } = await admin.from('space_claims').update({ status: 'rejected' }).eq('id', claimId).eq('status', 'pending')
    if (error) throw new Error('Não foi possível rejeitar a reivindicação.')
  }

  await writeAdminAudit(admin as any, {
    action: 'UPDATE',
    tableName: 'space_claims',
    userEmail: user.email || 'admin',
    message: `Reivindicação ${claimId} ${decision === 'approved' ? 'aprovada' : 'rejeitada'}`,
    data: { claim_id: claimId, space_id: claim.space_id, claimant_user_id: claim.user_id, decision },
  })

  revalidatePath('/admin/reivindicacoes')
  revalidatePath('/admin')
  revalidatePath('/dashboard/espaco')
  return { success: true, status: decision }
}
