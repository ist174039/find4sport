'use server'

import { requireAdmin } from '@/lib/auth/authorization'

export async function getAdminEvents() {
  const { admin } = await requireAdmin()
  const { data, error } = await admin
    .from('events')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching admin events:', error)
    return []
  }
  return data || []
}

export async function approveEventAction(id: string) {
  const { user, admin } = await requireAdmin()
  const { error } = await admin.from('events').update({ status: 'published' }).eq('id', id)
  if (!error) {
    await admin.from('audit_logs').insert([{
      action: 'UPDATE',
      table_name: 'events',
      user_email: user.email || 'admin@find4sport.pt',
      new_data: { action: `Evento ${id} aprovado` },
    }])
  }
  return { error }
}

export async function rejectEventAction(id: string) {
  const { user, admin } = await requireAdmin()
  const { error } = await admin.from('events').update({ status: 'cancelled' }).eq('id', id)
  if (!error) {
    await admin.from('audit_logs').insert([{
      action: 'UPDATE',
      table_name: 'events',
      user_email: user.email || 'admin@find4sport.pt',
      new_data: { action: `Evento ${id} rejeitado` },
    }])
  }
  return { error }
}

export async function deleteEventAction(id: string) {
  const { admin } = await requireAdmin()
  const { error } = await admin.from('events').delete().eq('id', id)
  return { error }
}

export async function createAdminEventAction(newEvent: any) {
  const { admin } = await requireAdmin()
  const { data, error } = await admin.from('events').insert([newEvent]).select()
  return { data, error }
}
