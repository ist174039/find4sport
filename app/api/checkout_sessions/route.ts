import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function toMinutes(value: string) {
  const [h, m] = value.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN
  return h * 60 + m
}

function addMinutes(value: string, durationMinutes: number) {
  const start = toMinutes(value)
  const total = start + durationMinutes
  if (!Number.isFinite(start) || total >= 24 * 60) return null
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`
}

function getBaseUrl(req: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) {
    try {
      return new URL(/^https?:\/\//i.test(configured) ? configured : `https://${configured}`).origin
    } catch {}
  }
  return new URL(req.url).origin
}

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) return NextResponse.json({ error: 'Stripe não está configurado.' }, { status: 503 })

    const stripe = new Stripe(stripeSecretKey)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 })

    const admin = createAdminClient()
    const body = await req.json()
    const serviceId = body.serviceId ? String(body.serviceId) : null
    const professionalId = body.professionalId ? String(body.professionalId) : null
    const spaceId = body.spaceId ? String(body.spaceId) : null
    const spaceRoomId = body.spaceRoomId ? String(body.spaceRoomId) : null
    const date = String(body.date || '')
    const startTime = String(body.startTime || '').slice(0, 5)

    if (!date || !startTime || (!serviceId && !spaceRoomId)) {
      return NextResponse.json({ error: 'Dados da reserva incompletos.' }, { status: 400 })
    }

    const bookingDate = new Date(`${date}T12:00:00`)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (Number.isNaN(bookingDate.getTime()) || bookingDate < today) {
      return NextResponse.json({ error: 'Data da reserva inválida.' }, { status: 400 })
    }

    const startMinutes = toMinutes(startTime)
    if (!Number.isFinite(startMinutes)) return NextResponse.json({ error: 'Hora de início inválida.' }, { status: 400 })

    let amount = 0
    let title = 'Reserva'
    let durationMinutes = 60
    let resolvedProfessionalId: string | null = null
    let resolvedSpaceId: string | null = null
    let resolvedRoomId: string | null = null
    let successReturn = '/dashboard'
    let cancelReturn = '/'

    if (serviceId) {
      const { data: service, error } = await admin
        .from('services')
        .select('id, name, price, professional_id, duration_minutes, is_active')
        .eq('id', serviceId)
        .maybeSingle()
      if (error || !service || !service.is_active) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 404 })
      if (professionalId && service.professional_id !== professionalId) return NextResponse.json({ error: 'Serviço inválido para este profissional.' }, { status: 400 })
      amount = Number(service.price || 0)
      title = service.name || 'Serviço'
      durationMinutes = Math.max(1, Number(service.duration_minutes || 60))
      resolvedProfessionalId = service.professional_id
      cancelReturn = `/profissionais/${service.professional_id}`
    } else if (spaceRoomId) {
      const { data: room, error } = await admin
        .from('space_rooms')
        .select('id, name, space_id, price_per_hour, is_active')
        .eq('id', spaceRoomId)
        .maybeSingle()
      if (error || !room || !room.is_active) return NextResponse.json({ error: 'Sala/campo indisponível.' }, { status: 404 })
      if (spaceId && room.space_id !== spaceId) return NextResponse.json({ error: 'Sala/campo inválido para este espaço.' }, { status: 400 })
      amount = Number(room.price_per_hour || 0)
      title = room.name || 'Sala/Campo'
      durationMinutes = 60
      resolvedSpaceId = room.space_id
      resolvedRoomId = room.id
      cancelReturn = `/espacos/${room.space_id}`
    }

    if (!(amount > 0)) return NextResponse.json({ error: 'Esta reserva não requer pagamento online.' }, { status: 400 })

    const endTime = addMinutes(startTime, durationMinutes)
    if (!endTime) return NextResponse.json({ error: 'Intervalo horário inválido.' }, { status: 400 })
    const dayOfWeek = bookingDate.getDay()

    if (resolvedProfessionalId) {
      const { data: availability } = await admin
        .from('professional_availability')
        .select('start_time, end_time')
        .eq('professional_id', resolvedProfessionalId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .maybeSingle()
      if (!availability || startTime < String(availability.start_time).slice(0, 5) || endTime > String(availability.end_time).slice(0, 5)) {
        return NextResponse.json({ error: 'O horário escolhido está fora da disponibilidade do profissional.' }, { status: 409 })
      }
    }

    if (resolvedRoomId) {
      const { data: availability } = await admin
        .from('space_room_availability')
        .select('start_time, end_time')
        .eq('room_id', resolvedRoomId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .maybeSingle()
      if (!availability || startTime < String(availability.start_time).slice(0, 5) || endTime > String(availability.end_time).slice(0, 5)) {
        return NextResponse.json({ error: 'O horário escolhido está fora da disponibilidade da sala/campo.' }, { status: 409 })
      }
    }

    let overlapQuery = admin.from('reservations').select('id').eq('date', date).in('status', ['pending', 'paid', 'confirmed']).lt('start_time', endTime).gt('end_time', startTime)
    if (resolvedProfessionalId) overlapQuery = overlapQuery.eq('professional_id', resolvedProfessionalId)
    if (resolvedRoomId) overlapQuery = overlapQuery.eq('space_room_id', resolvedRoomId)
    const { data: overlapping } = await overlapQuery.limit(1).maybeSingle()
    if (overlapping) return NextResponse.json({ error: 'Este horário já não está disponível.' }, { status: 409 })

    const { data: reservation, error: reservationError } = await admin
      .from('reservations')
      .insert({
        user_id: user.id,
        professional_id: resolvedProfessionalId,
        service_id: serviceId,
        space_id: resolvedSpaceId,
        space_room_id: resolvedRoomId,
        date,
        start_time: startTime,
        end_time: endTime,
        amount,
        status: 'pending',
        payment_status: 'pending',
      })
      .select('id')
      .single()
    if (reservationError || !reservation) return NextResponse.json({ error: 'Não foi possível criar a reserva.' }, { status: 500 })

    const baseUrl = getBaseUrl(req)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `Reserva: ${title}`, description: `Data: ${bookingDate.toLocaleDateString('pt-PT')} · ${startTime}–${endTime}` },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      success_url: `${baseUrl}${successReturn}?booking=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${cancelReturn}?booking=cancelled`,
      client_reference_id: reservation.id,
      metadata: { reservation_id: reservation.id },
    })

    await admin.from('reservations').update({ stripe_session_id: session.id }).eq('id', reservation.id)
    return NextResponse.json({ sessionId: session.id })
  } catch (err: any) {
    console.error('Booking checkout error:', err)
    return NextResponse.json({ error: err?.message || 'Erro ao iniciar pagamento.' }, { status: 500 })
  }
}
