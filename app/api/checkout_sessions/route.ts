import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia',
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serviceId, professionalId, date, startTime, endTime } = await req.json()

    // Fetch service to get the price
    const { data: service } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()

    if (!service || !service.price) {
      return NextResponse.json({ error: 'Service not found or has no price' }, { status: 400 })
    }

    // Create a pending reservation
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .insert({
        user_id: user.id,
        professional_id: professionalId,
        service_id: serviceId,
        date,
        start_time: startTime,
        end_time: endTime,
        amount: service.price,
        status: 'pending'
      })
      .select()
      .single()

    if (resError) {
      console.error(resError)
      return NextResponse.json({ error: 'Could not create reservation' }, { status: 500 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'mbway', 'multibanco'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Reserva: ${service.name}`,
              description: `Data: ${new Date(date).toLocaleDateString('pt-PT')} às ${startTime}`,
            },
            unit_amount: Math.round(service.price * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin')}/reservas/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin')}/profissionais/${professionalId}`,
      client_reference_id: reservation.id,
      metadata: {
        reservation_id: reservation.id,
      }
    })

    // Update reservation with stripe session id
    await supabase.from('reservations').update({ stripe_session_id: session.id }).eq('id', reservation.id)

    return NextResponse.json({ sessionId: session.id })
  } catch (err: any) {
    console.error('Stripe Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
