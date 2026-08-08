'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(receiverId: string, content: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Não autenticado')
  }

  const trimmedContent = content.trim()
  if (!receiverId || receiverId === user.id) {
    throw new Error('Destinatário inválido')
  }
  if (!trimmedContent) {
    throw new Error('A mensagem não pode estar vazia')
  }
  if (trimmedContent.length > 2000) {
    throw new Error('A mensagem excede o limite de 2000 caracteres')
  }

  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: trimmedContent,
    })

  if (error) {
    console.error('Erro ao enviar mensagem:', error)
    throw new Error('Erro ao enviar a mensagem')
  }

  revalidatePath('/dashboard/mensagens')
}

export async function markAsRead(messageIds: string[]) {
  if (!messageIds.length) return

  const uniqueMessageIds = [...new Set(messageIds)].filter(Boolean)
  if (!uniqueMessageIds.length) return

  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Não autenticado')
  }

  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .in('id', uniqueMessageIds)
    .eq('receiver_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('Erro ao marcar mensagens como lidas:', error)
  }

  revalidatePath('/dashboard/mensagens')
}
