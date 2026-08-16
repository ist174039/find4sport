'use server'

import { createClient } from '@/lib/supabase/server'

export async function updatePasswordAction(newPassword: string, confirmPassword: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sessão inválida.')
  if (newPassword !== confirmPassword) throw new Error('As passwords não coincidem.')
  if (newPassword.length < 10) throw new Error('A nova password deve ter pelo menos 10 caracteres.')
  if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) throw new Error('Use pelo menos uma letra e um número.')

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message || 'Não foi possível alterar a password.')
  return { success: true }
}
