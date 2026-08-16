'use server'

import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'

async function getProviderContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária.')

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !['professional', 'venue_manager'].includes(access.role)) throw new Error('Esta operação é exclusiva de profissionais e gestores de espaço.')
  return { user, role: access.role, admin: createAdminClient() }
}

export async function updateProviderReservationStatusAction(reservationId: string, newStatus: 'confirmed' | 'cancelled') {
  const { user, role, admin } = await getProviderContext()
  const db = admin as any
  const { data: reservation } = await db
    .from('reservations')
    .select('id,user_id,professional_id,space_id,status,payment_status,amount,stripe_session_id,package_purchase_id,package_session_consumed')
    .eq('id', reservationId)
    .maybeSingle()
  if (!reservation) throw new Error('Reserva não encontrada.')

  let authorized = false
  if (role === 'professional' && reservation.professional_id) {
    const { data } = await admin.from('professionals').select('id').eq('id', reservation.professional_id).eq('user_id', user.id).maybeSingle()
    authorized = Boolean(data)
  }
  if (role === 'venue_manager' && reservation.space_id) {
    const { data } = await admin.from('sport_spaces').select('id').eq('id', reservation.space_id).or(`owner_user_id.eq.${user.id},created_by.eq.${user.id}`).maybeSingle()
    authorized = Boolean(data)
  }
  if (!authorized) throw new Error('Não tem permissão para alterar esta reserva.')
  if (!['pending', 'paid', 'confirmed'].includes(reservation.status)) throw new Error('Esta reserva já não pode ser alterada.')

  if (newStatus === 'cancelled' && reservation.package_purchase_id && reservation.package_session_consumed) {
    const { data: purchase, error: purchaseError } = await db
      .from('service_package_purchases')
      .select('id,sessions_total,sessions_remaining,status,expires_at')
      .eq('id', reservation.package_purchase_id)
      .maybeSingle()
    if (purchaseError || !purchase) throw new Error('Não foi possível localizar o pacote associado à reserva. O cancelamento foi interrompido para preservar o saldo.')

    const previousRemaining = Number(purchase.sessions_remaining || 0)
    const restoredRemaining = Math.min(Number(purchase.sessions_total || previousRemaining + 1), previousRemaining + 1)
    const expired = purchase.expires_at && new Date(purchase.expires_at).getTime() <= Date.now()
    const restoredStatus = expired ? 'expired' : restoredRemaining > 0 ? 'active' : purchase.status

    const { data: restored, error: restoreError } = await db
      .from('service_package_purchases')
      .update({ sessions_remaining: restoredRemaining, status: restoredStatus, updated_at: new Date().toISOString() })
      .eq('id', purchase.id)
      .eq('sessions_remaining', previousRemaining)
      .select('id')
      .maybeSingle()
    if (restoreError || !restored) throw new Error('O saldo do pacote foi alterado entretanto. Tenta novamente.')

    const { error: cancelError } = await db
      .from('reservations')
      .update({ status: 'cancelled', payment_status: 'paid', package_session_consumed: false, updated_at: new Date().toISOString() })
      .eq('id', reservation.id)
      .eq('package_session_consumed', true)
    if (cancelError) {
      await db.from('service_package_purchases').update({ sessions_remaining: previousRemaining, status: purchase.status, updated_at: new Date().toISOString() }).eq('id', purchase.id).eq('sessions_remaining', restoredRemaining)
      throw new Error('Não foi possível cancelar a reserva; o crédito foi preservado.')
    }

    revalidatePath('/dashboard/reservas')
    revalidatePath('/dashboard/agenda')
    revalidatePath('/dashboard/compras')
    revalidatePath('/dashboard')
    return { success: true, packageCreditRestored: true }
  }

  if (newStatus === 'cancelled' && reservation.payment_status === 'paid') {
    if (!reservation.stripe_session_id) throw new Error('A reserva foi paga, mas não tem sessão Stripe associada. O cancelamento deve ser tratado pelo suporte para evitar divergência financeira.')
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Stripe não está configurado; não é seguro cancelar uma reserva paga sem executar o reembolso.')

    const stripe = new Stripe(key)
    const session = await stripe.checkout.sessions.retrieve(reservation.stripe_session_id)
    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
    if (!paymentIntentId) throw new Error('Não foi possível localizar o pagamento Stripe desta reserva.')

    let refund: Stripe.Refund
    try {
      refund = await stripe.refunds.create({ payment_intent: paymentIntentId, metadata: { reservation_id: reservation.id, cancelled_by: user.id } }, { idempotencyKey: `reservation-refund:${reservation.id}` })
    } catch (error: any) {
      throw new Error(error?.message || 'O reembolso Stripe falhou; a reserva não foi cancelada.')
    }

    const { error: updateError } = await admin.from('reservations').update({ status: 'cancelled', payment_status: refund.status === 'succeeded' ? 'refunded' : 'refund_pending', updated_at: new Date().toISOString() }).eq('id', reservation.id)
    if (updateError) throw new Error('O reembolso foi iniciado mas não foi possível atualizar a reserva. Contacte o suporte com o ID do reembolso: ' + refund.id)

    const { data: existingRefund } = await admin.from('transactions').select('id').eq('stripe_charge_id', refund.id).maybeSingle()
    if (!existingRefund) {
      await admin.from('transactions').insert({
        user_id: reservation.user_id,
        amount: Number(refund.amount || 0) / 100,
        currency: refund.currency || 'eur',
        type: 'refund',
        status: refund.status === 'succeeded' ? 'completed' : 'pending',
        stripe_charge_id: refund.id,
      })
    }

    revalidatePath('/dashboard/reservas')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/faturacao')
    return { success: true, refunded: true }
  }

  const { error } = await admin.from('reservations').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', reservation.id)
  if (error) throw new Error('Não foi possível atualizar a reserva.')
  revalidatePath('/dashboard/reservas')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function saveProfessionalAvailabilityAction(items: Array<{ day_of_week: number; start_time: string; end_time: string; is_active: boolean }>) {
  const { user, role, admin } = await getProviderContext()
  if (role !== 'professional') throw new Error('A disponibilidade desta página aplica-se apenas a profissionais.')
  const { data: professional } = await admin.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
  if (!professional) throw new Error('Perfil profissional não encontrado.')
  if (!Array.isArray(items) || items.length !== 7) throw new Error('Horário inválido.')

  const normalized = items.map(item => {
    if (!Number.isInteger(item.day_of_week) || item.day_of_week < 0 || item.day_of_week > 6) throw new Error('Dia da semana inválido.')
    if (!/^\d{2}:\d{2}$/.test(item.start_time) || !/^\d{2}:\d{2}$/.test(item.end_time)) throw new Error('Formato de hora inválido.')
    if (item.is_active && item.start_time >= item.end_time) throw new Error('A hora de início deve ser anterior à hora de fim.')
    return { professional_id: professional.id, day_of_week: item.day_of_week, start_time: item.start_time, end_time: item.end_time, is_active: Boolean(item.is_active) }
  })

  const { error } = await admin.from('professional_availability').upsert(normalized, { onConflict: 'professional_id,day_of_week' })
  if (error) throw new Error('Não foi possível guardar a disponibilidade.')
  revalidatePath('/dashboard/reservas')
  revalidatePath('/dashboard/agenda')
  return { success: true }
}
