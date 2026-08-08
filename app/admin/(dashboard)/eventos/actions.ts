'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'

function getAdminClient() {
  return createAdminClient()
}

async function requireAdminAccess() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Utilizador não autenticado')
  }

  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) {
    throw new Error('Sem permissões de administrador')
  }

  return { userEmail: user.email || 'admin@find4sport.pt' }
}

export async function getAdminEvents() {
  await requireAdminAccess()
  const supabase = getAdminClient()
  
  const { data, error } = await supabase
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
  const { userEmail } = await requireAdminAccess()
  const supabase = getAdminClient()
  
  const { error } = await supabase.from('events').update({ status: 'published' }).eq('id', id)
  if (!error) {
    await supabase.from('audit_logs').insert([{
      action: 'UPDATE', 
      table_name: 'events', 
      user_email: userEmail,
      new_data: { action: `Evento ${id} aprovado` }
    }])
  }
  return { error }
}

export async function rejectEventAction(id: string) {
  const { userEmail } = await requireAdminAccess()
  const supabase = getAdminClient()
  
  const { error } = await supabase.from('events').update({ status: 'cancelled' }).eq('id', id)
  if (!error) {
    await supabase.from('audit_logs').insert([{
      action: 'UPDATE', 
      table_name: 'events', 
      user_email: userEmail,
      new_data: { action: `Evento ${id} rejeitado` }
    }])
  }
  return { error }
}

export async function deleteEventAction(id: string) {
  await requireAdminAccess()
  const supabase = getAdminClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  return { error }
}

export async function createAdminEventAction(newEvent: any) {
  await requireAdminAccess()
  const supabase = getAdminClient()
  const { data, error } = await supabase.from('events').insert([newEvent]).select()
  return { data, error }
}
