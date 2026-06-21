// Notification Edge Function - sends push and in-app notifications
// Triggered by: DB webhooks (new bookings, messages, reviews, etc.)
// Or called directly from the app

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface NotificationPayload {
  userId: string
  type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'new_message' | 'new_review' | 'new_follower' | 'event_reminder' | 'space_claim' | 'moderation_flag' | 'system'
  title: string
  message: string
  data?: Record<string, unknown>
  pushEnabled?: boolean
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const payload: NotificationPayload = await req.json()

    const { userId, type, title, message, data, pushEnabled } = payload

    if (!userId || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'userId, title, and message are required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Save in-app notification
    const { error: insertError } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      data: data || null,
      is_read: false,
    })

    if (insertError) {
      console.error('Failed to insert notification:', insertError)
    }

    // 2. If push enabled, get user's push tokens and send
    if (pushEnabled) {
      const { data: pushTokens } = await supabase
        .from('user_push_tokens')
        .select('token')
        .eq('user_id', userId)

      if (pushTokens && pushTokens.length > 0) {
        const pushPromises = pushTokens.map(async (t) => {
          try {
            await fetch('https://fcm.googleapis.com/fcm/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `key=${Deno.env.get('FCM_SERVER_KEY') || ''}`,
              },
              body: JSON.stringify({
                to: t.token,
                notification: {
                  title,
                  body: message,
                  sound: 'default',
                },
                data: data || {},
              }),
            })
          } catch (pushErr) {
            console.error('Push send failed:', pushErr)
          }
        })
        await Promise.allSettled(pushPromises)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Notification function error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message || 'Internal error' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
