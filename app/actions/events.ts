'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function joinEventAction(eventId: string) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('user_not_authenticated')

  const admin = createAdminClient()
  const { data: event, error: eventError } = await admin
    .from('events')
    .select('id, status, capacity, start_date')
    .eq('id', eventId)
    .maybeSingle()

  if (eventError) {
    console.error('Error loading event for enrollment:', eventError)
    throw new Error('event_load_error')
  }
  if (!event) throw new Error('event_not_found')
  if (event.status !== 'published') throw new Error('event_not_available')
  if (event.start_date && new Date(event.start_date).getTime() < Date.now()) throw new Error('event_finished')

  const { data: existing, error: existingError } = await admin
    .from('event_participants')
    .select('id, status')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (existingError) throw new Error('participant_check_failed')
  if (existing) throw new Error('already_enrolled')

  if (event.capacity && Number(event.capacity) > 0) {
    const { count, error: countError } = await admin
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .in('status', ['confirmed', 'paid', 'pending'])
    if (countError) throw new Error('participant_count_failed')
    if ((count || 0) >= Number(event.capacity)) throw new Error('event_full')
  }

  const { error: insertError } = await admin.from('event_participants').insert({
    event_id: eventId,
    user_id: user.id,
    status: 'confirmed',
    payment_status: 'free',
  })
  if (insertError) {
    console.error('Error joining event:', insertError)
    if (insertError.code === '23505') throw new Error('already_enrolled')
    throw new Error('db_error')
  }

  revalidatePath(`/eventos/${eventId}`)
  revalidatePath('/dashboard/eventos')
  return { success: true }
}
