'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type MessagingAccess = { allowed: boolean; label?: string }

async function hasActiveMessagingContext(userA: string, userB: string): Promise<MessagingAccess> {
  const admin = createAdminClient()
  const { data: profiles } = await admin.from('platform_users').select('id,type').in('id', [userA, userB])
  const typeById = new Map((profiles || []).map(row => [row.id, row.type]))

  const resolvePair = async (athleteId: string, providerId: string) => {
    const [{ data: professional }, { data: spaces }] = await Promise.all([
      admin.from('professionals').select('id').eq('user_id', providerId).maybeSingle(),
      admin.from('sport_spaces').select('id').eq('owner_user_id', providerId),
    ])
    const clauses: string[] = []
    if (professional?.id) clauses.push(`professional_id.eq.${professional.id}`)
    if (spaces?.length) clauses.push(`space_id.in.(${spaces.map(space => space.id).join(',')})`)
    if (clauses.length) {
      const { data: reservation } = await admin.from('reservations').select('id,status,payment_status').eq('user_id', athleteId).in('status', ['paid', 'confirmed']).or(clauses.join(',')).limit(1).maybeSingle()
      if (reservation && (reservation.payment_status === 'paid' || reservation.status === 'confirmed')) return { allowed: true, label: 'Reserva ativa' }
    }

    const { data: participantRows } = await admin.from('event_participants').select('event_id,status,payment_status').eq('user_id', athleteId).eq('payment_status', 'paid').in('status', ['confirmed', 'paid'])
    const eventIds = (participantRows || []).map(row => row.event_id)
    if (eventIds.length) {
      const now = new Date().toISOString()
      const { data: event } = await admin.from('events').select('id').in('id', eventIds).eq('created_by', providerId).or(`end_date.is.null,end_date.gte.${now}`).limit(1).maybeSingle()
      if (event) return { allowed: true, label: 'Evento pago ativo' }
    }
    return { allowed: false }
  }

  const typeA = typeById.get(userA)
  const typeB = typeById.get(userB)
  if (typeA === 'athlete' && (typeB === 'professional' || typeB === 'venue_manager')) return resolvePair(userA, userB)
  if (typeB === 'athlete' && (typeA === 'professional' || typeA === 'venue_manager')) return resolvePair(userB, userA)
  return { allowed: false }
}

export async function canMessageUser(otherUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !otherUserId || otherUserId === user.id) return { allowed: false }
  return hasActiveMessagingContext(user.id, otherUserId)
}

export async function sendMessage(receiverId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const trimmedContent = content.trim()
  if (!receiverId || receiverId === user.id) throw new Error('Destinatário inválido')
  if (!trimmedContent) throw new Error('A mensagem não pode estar vazia')
  if (trimmedContent.length > 4000) throw new Error('A mensagem excede o limite de 4000 caracteres')

  const admin = createAdminClient()
  const { data: receiver } = await admin.from('platform_users').select('id').eq('id', receiverId).maybeSingle()
  if (!receiver) throw new Error('O destinatário já não está disponível.')

  const access = await hasActiveMessagingContext(user.id, receiverId)
  if (!access.allowed) throw new Error('Esta conversa está arquivada. As mensagens só ficam ativas enquanto existir uma reserva confirmada/paga ou um evento pago ativo entre as duas partes.')

  const { data: inserted, error } = await admin.from('messages').insert({ sender_id: user.id, receiver_id: receiverId, content: trimmedContent }).select('id,created_at').single()
  if (error || !inserted) throw new Error('Erro ao enviar a mensagem')

  revalidatePath('/dashboard/mensagens')
  return inserted
}

export async function markAsRead(messageIds: string[]) {
  if (!messageIds.length) return
  const uniqueMessageIds = [...new Set(messageIds)].filter(Boolean)
  if (!uniqueMessageIds.length) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const admin = createAdminClient()
  const { error } = await admin.from('messages').update({ read_at: new Date().toISOString() }).in('id', uniqueMessageIds).eq('receiver_id', user.id).is('read_at', null)
  if (error) console.error('Erro ao marcar mensagens como lidas:', error)
  revalidatePath('/dashboard/mensagens')
}
