import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  try {
    if (!stripeSecretKey || !webhookSecret) {
      return NextResponse.json({ error: 'Webhook configuration missing' }, { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-07-29.dahlia' as any,
    })

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: processedEvent } = await adminSupabase
      .from('stripe_webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .maybeSingle()

    if (processedEvent) {
      return NextResponse.json({ received: true })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const reservationId = session.metadata?.reservation_id

      if (reservationId) {
        const { data: reservation } = await adminSupabase
          .from('reservations')
          .select('id, amount, payment_status')
          .eq('id', reservationId)
          .maybeSingle()

        if (!reservation) {
          return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
        }

        if (reservation.payment_status === 'paid') {
          await adminSupabase.from('stripe_webhook_events').upsert(
            {
              event_id: event.id,
              event_type: event.type,
              reservation_id: reservationId,
              payload: event as any,
            },
            { onConflict: 'event_id', ignoreDuplicates: true }
          )
          return NextResponse.json({ received: true })
        }

        const paidAmount = (session.amount_total || 0) / 100
        if (Number(reservation.amount) !== Number(paidAmount)) {
          return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
        }

        await adminSupabase
          .from('reservations')
          .update({ 
            status: 'paid',
            payment_status: 'paid'
          })
          .eq('id', reservationId)

        await adminSupabase.from('stripe_webhook_events').upsert(
          {
            event_id: event.id,
            event_type: event.type,
            reservation_id: reservationId,
            payload: event as any,
          },
          { onConflict: 'event_id', ignoreDuplicates: true }
        )
      }
    } else {
      await adminSupabase.from('stripe_webhook_events').upsert(
        {
          event_id: event.id,
          event_type: event.type,
          payload: event as any,
        },
        { onConflict: 'event_id', ignoreDuplicates: true }
      )
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
  }
}
