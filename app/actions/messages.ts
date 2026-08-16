'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { assertWithinUsageLimit, incrementUsage, isFeatureEnabled } from '@/lib/billing/entitlements'
import { revalidatePath } from 'next/cache'

export async function sendMessage(receiverId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const trimmedContent = content.trim()
  if (!receiverId || receiverId === user.id) throw new Error('Destinatário inválido')
  if (!trimmedContent) throw new Error('A mensagem não pode estar vazia')
  if (trimmedContent.length > 2000) throw new Error('A mensagem excede o limite de 2000 caracteres')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('platform_users').select('type').eq('id', user.id).maybeSingle()
  const isProvider = profile?.type === 'professional' || profile?.type === 'venue_manager'

  if (isProvider) {
    if (!(await isFeatureEnabled(user.id, 'chat.enabled'))) throw new Error('Chat não está disponível no seu plano.')
    await assertWithinUsageLimit(user.id, 'chat.messages_daily.max', 'day')

    const { count, error: historyError } = await admin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
    if (historyError) throw historyError

    if ((count ?? 0) === 0) {
      await assertWithinUsageLimit(user.id, 'chat.new_conversations_daily.max', 'day')
    }
  }

  const { error } = await supabase.from('messages').insert({ sender_id: user.id, receiver_id: receiverId, content: trimmedContent })
  if (error) throw new Error('Erro ao enviar a mensagem')

  if (isProvider) {
    await incrementUsage(user.id, 'chat.messages_daily.max', 'day')
    const { count } = await admin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
    if ((count ?? 0) === 1) await incrementUsage(user.id, 'chat.new_conversations_daily.max', 'day')
  }

  revalidatePath('/dashboard/mensagens')
}

export async function markAsRead(messageIds: string[]) {
  if (!messageIds.length) return
  const uniqueMessageIds = [...new Set(messageIds)].filter(Boolean)
  if (!uniqueMessageIds.length) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .in('id', uniqueMessageIds)
    .eq('receiver_id', user.id)
    .is('read_at', null)

  if (error) console.error('Erro ao marcar mensagens como lidas:', error)
  revalidatePath('/dashboard/mensagens')
}
