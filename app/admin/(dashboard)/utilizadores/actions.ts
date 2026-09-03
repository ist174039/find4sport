'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminPermission } from '@/lib/auth/authorization'
import { writeAdminAudit } from '@/lib/admin/audit'

export async function moderateUserAction(userId: string, status: 'active' | 'suspended' | 'blocked', reason: string, days?: number) {
  const { user, admin } = await requireAdminPermission('platform_users.manage')
  const cleanReason = reason.trim()
  if (status !== 'active' && cleanReason.length < 10) throw new Error('Indique uma justificação com pelo menos 10 caracteres.')
  const durationDays = Math.min(365, Math.max(1, Number(days) || 7))
  const suspendedUntil = status === 'suspended' ? new Date(Date.now() + durationDays * 86400000).toISOString() : null
  // Keep authentication available: restricted users must be able to read the private decision page.
  const { error: authError } = await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' })
  if (authError) throw new Error(authError.message)
  const { error } = await (admin as any).from('platform_users').update({ account_status: status, moderation_reason: status === 'active' ? null : cleanReason, suspended_until: suspendedUntil, moderated_at: new Date().toISOString(), moderated_by: user.id }).eq('id', userId)
  if (error) throw new Error(error.message)
  await writeAdminAudit(admin as any, { action: 'UPDATE', tableName: 'platform_users', userEmail: user.email || 'admin', message: `Conta ${userId} alterada para ${status}`, data: { user_id: userId, status, reason: cleanReason || null, suspended_until: suspendedUntil } })
  revalidatePath('/admin/utilizadores')
  return { status, reason: cleanReason || null, suspendedUntil }
}
