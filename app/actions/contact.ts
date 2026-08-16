'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function submitContactMessageAction(formData: FormData) {
  const honeypot = String(formData.get('website') || '')
  if (honeypot) return { success: true }

  const fullName = String(formData.get('fullName') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const subject = String(formData.get('subject') || '').trim()
  const message = String(formData.get('message') || '').trim()

  if (fullName.length < 2 || fullName.length > 120) throw new Error('Indique um nome válido.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error('Indique um email válido.')
  if (!subject || subject.length > 120) throw new Error('Indique um assunto válido.')
  if (message.length < 10 || message.length > 5000) throw new Error('A mensagem deve ter entre 10 e 5000 caracteres.')

  const admin = createAdminClient()
  const { error } = await admin.from('contact_messages').insert({
    full_name: fullName,
    email,
    subject,
    message,
  })
  if (error) throw new Error('Não foi possível enviar a mensagem.')
  return { success: true }
}
