'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Não autenticado')
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Erro ao marcar notificação como lida:', error)
    throw new Error('Erro ao atualizar')
  }

  revalidatePath('/dashboard/notificacoes')
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Não autenticado')
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('Erro ao marcar todas como lidas:', error)
    throw new Error('Erro ao atualizar')
  }

  revalidatePath('/dashboard/notificacoes')
}

export async function deleteNotificationAction(notificationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Não autenticado')
  }

  if (!notificationId) {
    throw new Error('Notificação inválida')
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Erro ao apagar notificação:', error)
    throw new Error('Erro ao apagar notificação')
  }

  revalidatePath('/dashboard/notificacoes')
}
