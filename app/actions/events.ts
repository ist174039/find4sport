'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function joinEventAction(eventId: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('user_not_authenticated')
  }

  // Check if event exists
  const { data: event } = await supabase
    .from('events')
    .select('id, status, max_participants')
    .eq('id', eventId)
    .single()
    
  if (!event) {
    throw new Error('event_not_found')
  }

  if (event.status !== 'published') {
    throw new Error('event_not_available')
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from('event_participants')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    throw new Error('already_enrolled')
  }

  if (event.max_participants && Number(event.max_participants) > 0) {
    const { count: participantsCount } = await supabase
      .from('event_participants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)

    if ((participantsCount || 0) >= Number(event.max_participants)) {
      throw new Error('event_full')
    }
  }

  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: insertError } = await adminSupabase
    .from('event_participants')
    .insert({
      event_id: eventId,
      user_id: user.id,
      status: 'confirmed'
    })

  if (insertError) {
    console.error('Error joining event:', insertError)
    throw new Error('db_error')
  }

  revalidatePath(`/eventos/${eventId}`)
  revalidatePath('/dashboard/eventos')
  return { success: true }
}
