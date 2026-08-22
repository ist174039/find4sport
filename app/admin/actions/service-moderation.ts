'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminPermission } from '@/lib/auth/authorization'

export async function reviewServiceAction(id: string, decision: 'approved' | 'rejected', reason = '') {
  const { user, admin: db } = await requireAdminPermission('content.moderate')
  const { data: service } = await db.from('services').select('id,price,professional_id,moderation_status,is_active,moderation_reason,reviewed_at,reviewed_by').eq('id', id).maybeSingle()
  if (!service || service.moderation_status !== 'pending') throw new Error('Serviço não está pendente.')

  if (decision === 'approved' && Number(service.price || 0) > 0) {
    const { data: professional } = await db.from('professionals').select('stripe_account_id,status').eq('id', service.professional_id).maybeSingle()
    if (!professional || professional.status !== 'active' || !String(professional.stripe_account_id || '').startsWith('acct_')) {
      throw new Error('Serviço pago exige Stripe Connect ativo.')
    }
  }

  const clean = String(reason || '').trim()
  if (decision === 'rejected' && clean.length < 5) throw new Error('Indica o motivo da rejeição.')

  const now = new Date().toISOString()
  const moderationUpdate = {
    moderation_status: decision,
    is_active: decision === 'approved',
    moderation_reason: decision === 'rejected' ? clean : null,
  }
  const { data: updated, error } = await db.from('services').update(moderationUpdate).eq('id', id).eq('moderation_status', 'pending').select('id').maybeSingle()
  if (error) throw error
  if (!updated) throw new Error('O serviço já foi moderado por outro administrador.')

  const historyEntry = {
    service_id: id,
    from_status: service.moderation_status,
    to_status: decision,
    actor_user_id: user.id,
    ...(decision === 'rejected' ? { reason: clean } : {}),
  }
  const { error: historyError } = await db.from('service_moderation_history').insert(historyEntry)
  if (historyError) {
    const { error: rollbackError } = await db.from('services').update({
      moderation_status: service.moderation_status,
      is_active: service.is_active,
      moderation_reason: service.moderation_reason,
    }).eq('id', id).eq('moderation_status', decision)
    if (rollbackError) throw new Error(`Falhou o histórico de moderação e o rollback também falhou: ${rollbackError.message}`)
    throw new Error(`A moderação foi revertida porque não foi possível gravar o histórico: ${historyError.message}`)
  }

  revalidatePath('/admin/servicos')
  revalidatePath('/dashboard/servicos')
  revalidatePath('/profissionais')
}
