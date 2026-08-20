'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { writeAdminAudit } from '@/lib/admin/audit'

const CATEGORIES = ['general', 'account', 'billing', 'booking', 'professional', 'space', 'event', 'technical'] as const
const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const
const STATUSES = ['open', 'pending_admin', 'pending_user', 'resolved', 'closed'] as const

type Category = typeof CATEGORIES[number]
type Priority = typeof PRIORITIES[number]
type Status = typeof STATUSES[number]

function requiredText(value: FormDataEntryValue | null, label: string, min: number, max: number) {
  const text = String(value || '').trim()
  if (text.length < min || text.length > max) throw new Error(`${label} deve ter entre ${min} e ${max} caracteres.`)
  return text
}
function optionalUuid(value: FormDataEntryValue | null) {
  const id = String(value || '').trim()
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ? id : null
}
function enumValue<T extends readonly string[]>(value: FormDataEntryValue | null, allowed: T, fallback: T[number]): T[number] {
  const normalized = String(value || '')
  return allowed.includes(normalized as T[number]) ? normalized as T[number] : fallback
}

async function notifySupportUser(db: any, userId: string | null, ticketId: string, message: string, dedupeKey: string) {
  if (!userId) return
  const { error } = await db.from('notifications').insert({
    user_id: userId,
    type: 'system',
    message,
    link: `/dashboard/suporte/${ticketId}`,
    data: { support_ticket_id: ticketId },
    dedupe_key: dedupeKey,
  })
  if (error && error.code !== '23505') console.error('Support notification error:', error)
}

async function requirePlatformUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária.')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessDashboard) throw new Error('Conta da plataforma inválida.')
  return { user, db: createAdminClient() as any }
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão administrativa inválida.')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) throw new Error('Acesso administrativo necessário.')
  const db = createAdminClient() as any
  const { data: admin, error } = await db.from('admins').select('id,email,admin_type').eq('auth_user_id', user.id).maybeSingle()
  if (error || !admin) throw new Error('Perfil administrativo não encontrado.')
  return { user, admin, db }
}

export async function createUserSupportTicketAction(formData: FormData) {
  const { user, db } = await requirePlatformUser()
  const subject = requiredText(formData.get('subject'), 'Assunto', 4, 160)
  const message = requiredText(formData.get('message'), 'Mensagem', 10, 5000)
  const category = enumValue(formData.get('category'), CATEGORIES, 'general') as Category

  const { data: ticket, error } = await db.from('support_tickets').insert({
    user_id: user.id,
    subject,
    category,
    priority: 'normal',
    status: 'pending_admin',
  }).select('id').single()
  if (error || !ticket) throw new Error(error?.message || 'Não foi possível abrir o pedido de suporte.')

  const { error: messageError } = await db.from('support_messages').insert({ ticket_id: ticket.id, sender_user_id: user.id, body: message, is_internal: false })
  if (messageError) {
    await db.from('support_tickets').delete().eq('id', ticket.id)
    throw new Error('Não foi possível registar a primeira mensagem do pedido.')
  }
  revalidatePath('/dashboard/suporte')
  redirect(`/dashboard/suporte/${ticket.id}`)
}

export async function replyUserSupportTicketAction(formData: FormData) {
  const { user, db } = await requirePlatformUser()
  const ticketId = optionalUuid(formData.get('ticketId'))
  if (!ticketId) throw new Error('Pedido inválido.')
  const body = requiredText(formData.get('message'), 'Mensagem', 1, 5000)
  const { data: ticket } = await db.from('support_tickets').select('id,status').eq('id', ticketId).eq('user_id', user.id).maybeSingle()
  if (!ticket) throw new Error('Pedido de suporte não encontrado.')
  if (ticket.status === 'closed') throw new Error('Este pedido está encerrado. Abra um novo pedido se precisar de ajuda adicional.')
  const { error } = await db.from('support_messages').insert({ ticket_id: ticketId, sender_user_id: user.id, body, is_internal: false })
  if (error) throw new Error('Não foi possível enviar a mensagem.')
  await db.from('support_tickets').update({ status: 'pending_admin', updated_at: new Date().toISOString() }).eq('id', ticketId).eq('user_id', user.id)
  revalidatePath(`/dashboard/suporte/${ticketId}`)
  revalidatePath('/dashboard/suporte')
}

export async function createAdminSupportTicketAction(formData: FormData) {
  const { user, admin, db } = await requireAdmin()
  const userId = optionalUuid(formData.get('userId'))
  if (!userId) throw new Error('Utilizador inválido.')
  const subject = requiredText(formData.get('subject'), 'Assunto', 4, 160)
  const message = requiredText(formData.get('message'), 'Mensagem', 5, 5000)
  const category = enumValue(formData.get('category'), CATEGORIES, 'general') as Category
  const priority = enumValue(formData.get('priority'), PRIORITIES, 'normal') as Priority
  const { data: target } = await db.from('platform_users').select('id').eq('id', userId).maybeSingle()
  if (!target) throw new Error('Utilizador da plataforma não encontrado.')

  const { data: ticket, error } = await db.from('support_tickets').insert({
    user_id: userId,
    created_by_admin_id: admin.id,
    assigned_admin_id: admin.id,
    subject,
    category,
    priority,
    status: 'pending_user',
  }).select('id').single()
  if (error || !ticket) throw new Error(error?.message || 'Não foi possível abrir o caso de suporte.')
  const { data: supportMessage, error: messageError } = await db.from('support_messages').insert({ ticket_id: ticket.id, sender_admin_id: admin.id, body: message, is_internal: false }).select('id').single()
  if (messageError || !supportMessage) {
    await db.from('support_tickets').delete().eq('id', ticket.id)
    throw new Error('Não foi possível registar a primeira mensagem.')
  }
  await notifySupportUser(db, userId, ticket.id, `A equipa FIND4SPORT abriu um pedido de suporte: ${subject}`, `support:${ticket.id}:${supportMessage.id}`)
  await writeAdminAudit(db, { action: 'INSERT', tableName: 'support_tickets', userEmail: user.email || admin.email, message: `Caso de suporte ${ticket.id} aberto para ${userId}`, data: { ticket_id: ticket.id, user_id: userId } })
  revalidatePath('/admin/suporte')
  revalidatePath(`/admin/utilizadores/${userId}`)
  revalidatePath('/dashboard/notificacoes')
  redirect(`/admin/suporte/${ticket.id}`)
}

export async function replyAdminSupportTicketAction(formData: FormData) {
  const { user, admin, db } = await requireAdmin()
  const ticketId = optionalUuid(formData.get('ticketId'))
  if (!ticketId) throw new Error('Caso inválido.')
  const body = requiredText(formData.get('message'), 'Mensagem', 1, 5000)
  const internal = String(formData.get('internal') || '') === 'true'
  const { data: ticket } = await db.from('support_tickets').select('id,user_id,status').eq('id', ticketId).maybeSingle()
  if (!ticket) throw new Error('Caso de suporte não encontrado.')
  const { data: supportMessage, error } = await db.from('support_messages').insert({ ticket_id: ticketId, sender_admin_id: admin.id, body, is_internal: internal }).select('id').single()
  if (error || !supportMessage) throw new Error('Não foi possível enviar a mensagem.')
  if (!internal) {
    await db.from('support_tickets').update({ status: 'pending_user', assigned_admin_id: admin.id, updated_at: new Date().toISOString() }).eq('id', ticketId)
    await notifySupportUser(db, ticket.user_id, ticketId, 'A equipa FIND4SPORT respondeu ao teu pedido de suporte.', `support:${ticketId}:${supportMessage.id}`)
  }
  await writeAdminAudit(db, { action: 'INSERT', tableName: 'support_messages', userEmail: user.email || admin.email, message: `${internal ? 'Nota interna' : 'Resposta'} no caso ${ticketId}`, data: { ticket_id: ticketId, internal } })
  revalidatePath(`/admin/suporte/${ticketId}`)
  revalidatePath('/admin/suporte')
  revalidatePath('/dashboard/notificacoes')
  if (ticket.user_id) revalidatePath(`/admin/utilizadores/${ticket.user_id}`)
}

export async function updateAdminSupportTicketAction(formData: FormData) {
  const { user, admin, db } = await requireAdmin()
  const ticketId = optionalUuid(formData.get('ticketId'))
  if (!ticketId) throw new Error('Caso inválido.')
  const status = enumValue(formData.get('status'), STATUSES, 'open') as Status
  const priority = enumValue(formData.get('priority'), PRIORITIES, 'normal') as Priority
  const now = new Date().toISOString()
  const { data, error } = await db.from('support_tickets').update({
    status,
    priority,
    assigned_admin_id: admin.id,
    updated_at: now,
    closed_at: status === 'closed' ? now : null,
  }).eq('id', ticketId).select('id,user_id').maybeSingle()
  if (error || !data) throw new Error(error?.message || 'Não foi possível atualizar o caso.')
  if (status === 'resolved' || status === 'closed') {
    await notifySupportUser(db, data.user_id, ticketId, `O teu pedido de suporte foi marcado como ${status === 'resolved' ? 'resolvido' : 'fechado'}.`, `support-status:${ticketId}:${status}:${now}`)
    revalidatePath('/dashboard/notificacoes')
  }
  await writeAdminAudit(db, { action: 'UPDATE', tableName: 'support_tickets', userEmail: user.email || admin.email, message: `Caso ${ticketId} atualizado`, data: { ticket_id: ticketId, status, priority } })
  revalidatePath(`/admin/suporte/${ticketId}`)
  revalidatePath('/admin/suporte')
  if (data.user_id) revalidatePath(`/admin/utilizadores/${data.user_id}`)
}
