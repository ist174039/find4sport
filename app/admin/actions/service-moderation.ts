'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/authorization'

export async function reviewServiceAction(id: string, decision: 'approved' | 'rejected', reason = '') {
  const { user, admin: db } = await requireAdmin()
  const { data: service } = await db.from('services').select('id,price,professional_id,moderation_status').eq('id', id).maybeSingle()
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
    reviewed_at: now,
    reviewed_by: user.id,
    is_active: decision === 'approved',
    ...(decision === 'rejected' ? { moderation_reason: clean } : {}),
  }
  const { error } = await db.from('services').update(moderationUpdate).eq('id', id).eq('moderation_status', 'pending')
  if (error) throw error

  const historyEntry = {
    service_id: id,
    from_status: service.moderation_status,
    to_status: decision,
    actor_user_id: user.id,
    ...(decision === 'rejected' ? { reason: clean } : {}),
  }
  const { error: historyError } = await db.from('service_moderation_history').insert(historyEntry)
  if (historyError) throw historyError

  revalidatePath('/admin/servicos')
  revalidatePath('/dashboard/servicos')
  revalidatePath('/profissionais')
}
