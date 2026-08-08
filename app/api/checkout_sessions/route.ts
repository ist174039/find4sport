import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

function toMinutes(value: string) {
  const [h, m] = value.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN
  return h * 60 + m
}

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-07-29.dahlia' as any,
    })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serviceId, professionalId, date, startTime, endTime } = await req.json()

    if (!serviceId || !professionalId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const bookingDate = new Date(`${date}T00:00:00`)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    if (Number.isNaN(bookingDate.getTime()) || bookingDate < now) {
      return NextResponse.json({ error: 'Invalid booking date' }, { status: 400 })
    }

    const startMinutes = toMinutes(startTime)
    const endMinutes = toMinutes(endTime)
    if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) {
      return NextResponse.json({ error: 'Invalid time range' }, { status: 400 })
    }

    // Fetch service to get the price
    const { data: service } = await supabase
      .from('services')
      .select('id, name, price, professional_id')
      .eq('id', serviceId)
      .eq('professional_id', professionalId)
      .single()

    if (!service || !service.price) {
      return NextResponse.json({ error: 'Service not found or has no price' }, { status: 400 })
    }

    const { data: overlappingReservation } = await supabase
      .from('reservations')
      .select('id')
      .eq('professional_id', professionalId)
      .eq('date', date)
      .in('status', ['pending', 'paid', 'confirmed'])
      .lt('start_time', endTime)
      .gt('end_time', startTime)
      .limit(1)
      .maybeSingle()

    if (overlappingReservation) {
      return NextResponse.json({ error: 'Time slot not available' }, { status: 409 })
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
        status: 'pending',
        payment_status: 'pending'
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
