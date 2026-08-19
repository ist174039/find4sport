'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

function revalidateEventParticipation(eventId: string) {
  revalidatePath(`/eventos/${eventId}`)
  revalidatePath('/dashboard/eventos')
  revalidatePath('/dashboard/agenda')
  revalidatePath('/dashboard')
}

export async function joinEventAction(eventId: string) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('user_not_authenticated')

  const admin = createAdminClient()
  const { data: event, error: eventError } = await admin
    .from('events')
    .select('id, status, capacity, start_date, price_min, created_by')
    .eq('id', eventId)
    .maybeSingle()

  if (eventError) {
    console.error('Error loading event for enrollment:', eventError)
    throw new Error('event_load_error')
  }
  if (!event) throw new Error('event_not_found')
  if (event.status !== 'published') throw new Error('event_not_available')
  if (event.start_date && new Date(event.start_date).getTime() < Date.now()) throw new Error('event_finished')
  if (event.created_by === user.id) throw new Error('own_event')

  const { data: paidTicket, error: ticketError } = await admin
    .from('event_ticket_types')
    .select('id')
    .eq('event_id', eventId)
    .eq('is_active', true)
    .gt('price', 0)
    .limit(1)
    .maybeSingle()
  if (ticketError) throw new Error('ticket_check_failed')
  if (Number(event.price_min || 0) > 0 || paidTicket) throw new Error('payment_required')

  const { data: existing, error: existingError } = await admin
    .from('event_participants')
    .select('id, status')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (existingError) throw new Error('participant_check_failed')
  if (existing) throw new Error('already_enrolled')

  if (event.capacity && Number(event.capacity) > 0) {
    const { count, error: countError } = await admin
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .in('status', ['confirmed', 'paid', 'pending'])
    if (countError) throw new Error('participant_count_failed')
    if ((count || 0) >= Number(event.capacity)) throw new Error('event_full')
  }

  const { error: insertError } = await admin.from('event_participants').insert({
    event_id: eventId,
    user_id: user.id,
    status: 'confirmed',
    payment_status: 'free',
  })
  if (insertError) {
    console.error('Error joining event:', insertError)
    if (insertError.code === '23505') throw new Error('already_enrolled')
    throw new Error('db_error')
  }

  revalidateEventParticipation(eventId)
  return { success: true }
}

export async function cancelEventParticipationAction(participantId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Autenticação necessária.')

  const admin = createAdminClient()
  const { data: participant, error: participantError } = await admin
    .from('event_participants')
    .select('id,event_id,user_id,status,payment_status,amount')
    .eq('id', participantId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (participantError) throw new Error('Não foi possível carregar a inscrição.')
  if (!participant) throw new Error('Inscrição não encontrada.')
  if (participant.status === 'cancelled') return
  if (participant.status === 'attended') throw new Error('Uma participação já realizada não pode ser cancelada.')

  const { data: event } = await admin
    .from('events')
    .select('id,start_date')
    .eq('id', participant.event_id)
    .maybeSingle()
  if (!event) throw new Error('Evento não encontrado.')
  if (event.start_date && new Date(event.start_date).getTime() <= Date.now()) throw new Error('O evento já começou e a inscrição já não pode ser cancelada.')

  if (participant.payment_status === 'pending' || participant.status === 'pending') {
    throw new Error('O pagamento desta inscrição ainda está pendente. Por segurança, a vaga só pode ser libertada quando o checkout expirar ou o pagamento for concluído.')
  }

  if (participant.payment_status === 'free' || Number(participant.amount || 0) === 0) {
    const { error } = await admin
      .from('event_participants')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', participant.id)
      .eq('user_id', user.id)
    if (error) throw new Error('Não foi possível cancelar a inscrição.')
    revalidateEventParticipation(participant.event_id)
    return
  }

  if (participant.payment_status !== 'paid') throw new Error('O estado financeiro desta inscrição não permite cancelamento automático.')

  const db = admin as any
  const { data: transaction, error: transactionError } = await db
    .from('transactions')
    .select('id,stripe_payment_intent_id,stripe_charge_id,status')
    .eq('source_type', 'event')
    .eq('source_id', participant.id)
    .eq('type', 'event_payment')
    .eq('status', 'completed')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (transactionError || !transaction) throw new Error('Não foi possível localizar o pagamento desta inscrição. Contacta o suporte antes de cancelar.')
  if (!transaction.stripe_payment_intent_id) throw new Error('O pagamento não tem referência Stripe suficiente para executar um reembolso seguro.')

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) throw new Error('Stripe não está configurado; o cancelamento pago foi interrompido para preservar a consistência financeira.')

  const stripe = new Stripe(stripeKey)
  let refund: Stripe.Refund
  try {
    refund = await stripe.refunds.create(
      { payment_intent: transaction.stripe_payment_intent_id, metadata: { event_participant_id: participant.id, event_id: participant.event_id, cancelled_by: user.id } },
      { idempotencyKey: `event-participation-refund:${participant.id}` },
    )
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'O reembolso Stripe falhou; a inscrição não foi cancelada.')
  }

  const paymentStatus = refund.status === 'succeeded' ? 'refunded' : 'refund_pending'
  const { error: updateError } = await admin
    .from('event_participants')
    .update({ status: 'cancelled', payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq('id', participant.id)
    .eq('user_id', user.id)
    .eq('payment_status', 'paid')

  if (updateError) throw new Error(`O reembolso ${refund.id} foi iniciado, mas não foi possível atualizar a inscrição. Contacta o suporte com esta referência.`)

  revalidateEventParticipation(participant.event_id)
}
