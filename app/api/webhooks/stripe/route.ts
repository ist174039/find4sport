import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature') as string

    let event: Stripe.Event

    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // If no webhook secret is configured (e.g. local dev without it), we just parse the body
      event = JSON.parse(body) as Stripe.Event
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const reservationId = session.metadata?.reservation_id

      if (reservationId) {
        const supabase = await createClient()
        // Here we bypass RLS for webhook via service role if needed, 
        // but since it's a server component with createClient, it uses anon/user.
        // Actually, webhooks need a service role client to bypass RLS.
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
        const adminSupabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        await adminSupabase
          .from('reservations')
          .update({ 
            status: 'paid',
            payment_status: 'paid'
          })
          .eq('id', reservationId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
  }
}
