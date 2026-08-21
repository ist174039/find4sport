'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminAccess } from '@/lib/auth/access'

export async function reviewServiceAction(id: string, decision: 'approved' | 'rejected', reason = '') {
  const { user, admin } = await requireAdminAccess()
  const db = admin as any
  const { data: service } = await db.from('services').select('id,price,professional_id,moderation_status').eq('id', id).maybeSingle()
  if (!service || service.moderation_status !== 'pending') throw new Error('Serviço não está pendente.')

  if (decision === 'approved' && Number(service.price || 0) > 0) {
    const { data: professional } = await db.from('professionals').select('stripe_account_id,status').eq('id', service.professional_id).maybeSingle()
    if (!professional || professional.status !== 'active' || !String(professional.stripe_account_id || '').startsWith('acct_')) {
      throw new Error('Serviço pago exige Stripe Connect ativo.')
    }
  }

  const cleanReason = String(reason || '').trim()
  if (decision === 'rejected' && cleanReason.length < 5) throw new Error('Indica o motivo da rejeição.')

  const now = new Date().toISOString()
  const { error } = await db.from('services').update({
    moderation_status: decision,
    moderation_reason: decision === 'rejected' ? cleanReason : null,
    reviewed_at: now,
    reviewed_by: user.id,
    is_active: decision === 'approved',
  }).eq('id', id).eq('moderation_status', 'pending')
  if (error) throw error

  await db.from('service_moderation_events').insert({
    service_id: id,
    event_type: decision,
    actor_user_id: user.id,
    note: decision === 'rejected' ? cleanReason : null,
  })

  revalidatePath('/admin/servicos')
  revalidatePath('/dashboard/servicos')
  revalidatePath('/profissionais')
}
