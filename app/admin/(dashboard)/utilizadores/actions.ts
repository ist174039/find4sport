'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminPermission } from '@/lib/auth/authorization'
import { writeAdminAudit } from '@/lib/admin/audit'

function metadataWithStatus(current: Record<string, unknown> | null | undefined, status: 'suspended' | null) {
  const next = { ...(current || {}) }
  delete next.account_status
  delete next.suspended_at
  delete next.deactivated_at
  delete next.deletion_requested_at
  if (status === 'suspended') {
    next.account_status = 'suspended'
    next.suspended_at = new Date().toISOString()
  }
  return next
}

export async function setPlatformUserSuspensionAction(userId: string, suspended: boolean) {
  const { user: actor, admin } = await requireAdminPermission('platform_users.manage')
  if (!userId || userId === actor.id) throw new Error('Utilizador inválido.')

  const { data: profile } = await admin.from('platform_users').select('id,full_name,type').eq('id', userId).maybeSingle()
  if (!profile) throw new Error('Utilizador da plataforma não encontrado.')

  const { data: authResult, error: authReadError } = await admin.auth.admin.getUserById(userId)
  if (authReadError || !authResult.user) throw new Error('Conta de autenticação não encontrada.')

  const currentStatus = String(authResult.user.app_metadata?.account_status || authResult.user.user_metadata?.account_status || '')
  if (currentStatus === 'deletion_requested') throw new Error('Existe um pedido de eliminação pendente; deve ser tratado pelo respetivo processo.')

  const appMetadata = metadataWithStatus(authResult.user.app_metadata, suspended ? 'suspended' : null)
  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: appMetadata,
    ban_duration: suspended ? '876000h' : 'none',
  })
  if (error) throw new Error(suspended ? 'Não foi possível suspender a conta.' : 'Não foi possível reativar a conta.')

  await writeAdminAudit(admin as any, {
    action: 'UPDATE',
    tableName: 'auth.users',
    userEmail: actor.email || 'admin',
    message: suspended ? `Conta ${userId} suspensa administrativamente` : `Conta ${userId} reativada administrativamente`,
    data: { target_user_id: userId, target_name: profile.full_name, target_type: profile.type, previous_status: currentStatus || 'active', account_status: suspended ? 'suspended' : 'active' },
  })

  revalidatePath('/admin/utilizadores')
  revalidatePath(`/admin/utilizadores/${userId}`)
  return { success: true }
}
