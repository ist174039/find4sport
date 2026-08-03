'use server'

import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

export async function getAdminEvents() {
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
  const supabase = getAdminClient()
  
  const { error } = await supabase.from('events').update({ status: 'published' }).eq('id', id)
  if (!error) {
    await supabase.from('audit_logs').insert([{
      action: 'UPDATE', 
      table_name: 'events', 
      user_email: 'admin@find4sport.pt',
      new_data: { action: `Evento ${id} aprovado` }
    }])
  }
  return { error }
}

export async function rejectEventAction(id: string) {
  const supabase = getAdminClient()
  
  const { error } = await supabase.from('events').update({ status: 'cancelled' }).eq('id', id)
  if (!error) {
    await supabase.from('audit_logs').insert([{
      action: 'UPDATE', 
      table_name: 'events', 
      user_email: 'admin@find4sport.pt',
      new_data: { action: `Evento ${id} rejeitado` }
    }])
  }
  return { error }
}

export async function deleteEventAction(id: string) {
  const supabase = getAdminClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  return { error }
}

export async function createAdminEventAction(newEvent: any) {
  const supabase = getAdminClient()
  const { data, error } = await supabase.from('events').insert([newEvent]).select()
  return { data, error }
}
