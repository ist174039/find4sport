import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : NaN
}

function addMinutes(value: string, durationMinutes: number) {
  const start = toMinutes(value)
  const total = start + durationMinutes
  if (!Number.isFinite(start) || total >= 1440) return null
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function missingRoomColumn(error: any) {
  const code = String(error?.code || '')
  const message = String(error?.message || '')
  return ['42703', 'PGRST204'].includes(code) || message.includes('space_room_id') || message.includes("Could not find the 'space_room_id' column")
}

function getBaseUrl(request: Request) {
  const origin = request.headers.get('origin')
  if (origin) { try { return new URL(origin).origin } catch {} }
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  if (host) { try { return new URL(`${protocol}://${host}`).origin } catch {} }
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) { try { return new URL(/^https?:\/\//i.test(configured) ? configured : `https://${configured}`).origin } catch {} }
  return new URL(request.url).origin
}

export async function POST(request: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) return NextResponse.json({ error: 'Stripe não está configurado.' }, { status: 503 })

    const stripe = new Stripe(secret)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 })

    const admin = createAdminClient()
    const body = await request.json().catch(() => ({}))
    const baseUrl = getBaseUrl(request)

    if (body.eventId) {
      const eventId = String(body.eventId)
      const { data: event, error: eventError } = await admin.from('events').select('id,title,price_min,status,capacity,start_date').eq('id', eventId).maybeSingle()
      if (eventError || !event) return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
      if (event.status !== 'published' || (event.start_date && new Date(event.start_date).getTime() < Date.now())) return NextResponse.json({ error: 'Este evento já não aceita inscrições.' }, { status: 409 })

      const amount = Number(event.price_min || 0)
      if (!(amount > 0)) return NextResponse.json({ error: 'Este evento não requer pagamento.' }, { status: 400 })
      const { data: existing } = await admin.from('event_participants').select('id,status').eq('event_id', eventId).eq('user_id', user.id).maybeSingle()
      if (existing) return NextResponse.json({ error: 'Já estás inscrito neste evento.' }, { status: 409 })

      if (event.capacity && Number(event.capacity) > 0) {
        const { count } = await admin.from('event_participants').select('id', { count: 'exact', head: true }).eq('event_id', eventId).in('status', ['confirmed', 'paid', 'pending'])
        if ((count || 0) >= Number(event.capacity)) return NextResponse.json({ error: 'Evento esgotado.' }, { status: 409 })
      }

      const { data: participant, error: participantError } = await admin.from('event_participants').insert({ event_id: eventId, user_id: user.id, status: 'pending', payment_status: 'pending' }).select('id').single()
      if (participantError || !participant) {
        console.error('Event participant insert error:', participantError)
        return NextResponse.json({ error: 'Não foi possível iniciar a inscrição no evento.' }, { status: 500 })
      }

      try {
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [{ price_data: { currency: 'eur', product_data: { name: `Evento: ${event.title}` }, unit_amount: Math.round(amount * 100) }, quantity: 1 }],
          success_url: new URL('/dashboard/agenda?event=success&session_id={CHECKOUT_SESSION_ID}', baseUrl).toString(),
          cancel_url: new URL(`/eventos/${eventId}?event=cancelled`, baseUrl).toString(),
          client_reference_id: participant.id,
          metadata: { event_participant_id: participant.id, event_id: eventId, transaction_type: 'event' },
        }, { idempotencyKey: `event-checkout:${participant.id}` })
        if (!session.url) throw new Error('Stripe não devolveu URL de checkout.')
        return NextResponse.json({ url: session.url })
      } catch (error) {
        await admin.from('event_participants').delete().eq('id', participant.id).eq('status', 'pending').eq('payment_status', 'pending')
        throw error
      }
    }

    const serviceId = body.serviceId ? String(body.serviceId) : null
    const professionalId = body.professionalId ? String(body.professionalId) : null
    const spaceId = body.spaceId ? String(body.spaceId) : null
    const spaceRoomId = body.spaceRoomId ? String(body.spaceRoomId) : null
    const date = String(body.date || '')
    const startTime = String(body.startTime || '').slice(0, 5)

    if (!date || !startTime || (!serviceId && !spaceRoomId)) return NextResponse.json({ error: 'Dados da reserva incompletos.' }, { status: 400 })
    const bookingDate = new Date(`${date}T12:00:00`)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (Number.isNaN(bookingDate.getTime()) || bookingDate < today) return NextResponse.json({ error: 'Data da reserva inválida.' }, { status: 400 })
    if (!Number.isFinite(toMinutes(startTime))) return NextResponse.json({ error: 'Hora de início inválida.' }, { status: 400 })

    let amount = 0
    let title = 'Reserva'
    let durationMinutes = 60
    let resolvedProfessionalId: string | null = null
    let resolvedSpaceId: string | null = null
    let resolvedRoomId: string | null = null
    let cancelReturn = '/'

    if (serviceId) {
      const { data: service, error } = await admin.from('services').select('id,name,price,professional_id,duration_minutes,is_active').eq('id', serviceId).maybeSingle()
      if (error || !service || !service.is_active) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 404 })
      if (professionalId && service.professional_id !== professionalId) return NextResponse.json({ error: 'Serviço inválido para este profissional.' }, { status: 400 })
      amount = Number(service.price || 0)
      title = service.name || 'Serviço'
      durationMinutes = Math.max(1, Number(service.duration_minutes || 60))
      resolvedProfessionalId = service.professional_id
      cancelReturn = `/profissionais/${service.professional_id}`
    } else {
      const { data: room, error } = await admin.from('space_rooms').select('id,name,space_id,price_per_hour,is_active').eq('id', spaceRoomId!).maybeSingle()
      if (error || !room || !room.is_active) return NextResponse.json({ error: 'Sala/campo indisponível.' }, { status: 404 })
      if (spaceId && room.space_id !== spaceId) return NextResponse.json({ error: 'Sala/campo inválido para este espaço.' }, { status: 400 })
      amount = Number(room.price_per_hour || 0)
      title = room.name || 'Sala/Campo'
      resolvedSpaceId = room.space_id
      resolvedRoomId = room.id
      cancelReturn = `/espacos/${room.space_id}`
    }

    if (!(amount > 0)) return NextResponse.json({ error: 'Esta reserva não requer pagamento online.' }, { status: 400 })
    const endTime = addMinutes(startTime, durationMinutes)
    if (!endTime) return NextResponse.json({ error: 'Intervalo horário inválido.' }, { status: 400 })
    const dayOfWeek = bookingDate.getDay()

    if (resolvedProfessionalId) {
      const { data: slots, error } = await admin.from('professional_availability').select('start_time,end_time').eq('professional_id', resolvedProfessionalId).eq('day_of_week', dayOfWeek).eq('is_active', true)
      if (error) return NextResponse.json({ error: 'Não foi possível validar a disponibilidade do profissional.' }, { status: 500 })
      const valid = (slots || []).some(slot => startTime >= String(slot.start_time).slice(0, 5) && endTime <= String(slot.end_time).slice(0, 5))
      if (!valid) return NextResponse.json({ error: 'O horário escolhido está fora da disponibilidade do profissional.' }, { status: 409 })
    }
    if (resolvedRoomId) {
      const { data: slots, error } = await admin.from('space_room_availability').select('start_time,end_time').eq('room_id', resolvedRoomId).eq('day_of_week', dayOfWeek).eq('is_active', true)
      if (error) return NextResponse.json({ error: 'Não foi possível validar a disponibilidade da sala/campo.' }, { status: 500 })
      const valid = (slots || []).some(slot => startTime >= String(slot.start_time).slice(0, 5) && endTime <= String(slot.end_time).slice(0, 5))
      if (!valid) return NextResponse.json({ error: 'O horário escolhido está fora da disponibilidade da sala/campo.' }, { status: 409 })
    }

    const baseOverlap = () => admin.from('reservations').select('id').eq('date', date).in('status', ['pending', 'paid', 'confirmed']).lt('start_time', endTime).gt('end_time', startTime)
    let overlapResult
    if (resolvedProfessionalId) overlapResult = await baseOverlap().eq('professional_id', resolvedProfessionalId).limit(1)
    else if (resolvedRoomId) {
      overlapResult = await baseOverlap().eq('space_room_id', resolvedRoomId).limit(1)
      if (overlapResult.error && missingRoomColumn(overlapResult.error)) overlapResult = await baseOverlap().eq('space_id', resolvedSpaceId!).limit(1)
    } else overlapResult = await baseOverlap().limit(1)

    if (overlapResult.error) return NextResponse.json({ error: `Não foi possível validar conflitos de agenda: ${overlapResult.error.message}` }, { status: 500 })
    if (overlapResult.data?.length) return NextResponse.json({ error: 'Este horário já não está disponível.' }, { status: 409 })

    const reservationPayload: Record<string, unknown> = {
      user_id: user.id,
      professional_id: resolvedProfessionalId,
      service_id: serviceId,
      space_id: resolvedSpaceId,
      date,
      start_time: startTime,
      end_time: endTime,
      amount,
      status: 'pending',
      payment_status: 'pending',
    }
    if (resolvedRoomId) reservationPayload.space_room_id = resolvedRoomId

    let reservationResult = await admin.from('reservations').insert(reservationPayload).select('id').single()
    if (reservationResult.error && resolvedRoomId && missingRoomColumn(reservationResult.error)) {
      const { space_room_id: _ignored, ...legacyPayload } = reservationPayload
      reservationResult = await admin.from('reservations').insert(legacyPayload).select('id').single()
    }

    if (reservationResult.error || !reservationResult.data) {
      console.error('Paid reservation insert error:', reservationResult.error)
      return NextResponse.json({ error: reservationResult.error?.message ? `Não foi possível criar a reserva: ${reservationResult.error.message}` : 'Não foi possível criar a reserva.' }, { status: 500 })
    }
    const reservation = reservationResult.data

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price_data: { currency: 'eur', product_data: { name: `Reserva: ${title}`, description: `Data: ${bookingDate.toLocaleDateString('pt-PT')} · ${startTime}–${endTime}` }, unit_amount: Math.round(amount * 100) }, quantity: 1 }],
        success_url: new URL('/dashboard/agenda?booking=success&session_id={CHECKOUT_SESSION_ID}', baseUrl).toString(),
        cancel_url: new URL(`${cancelReturn}?booking=cancelled`, baseUrl).toString(),
        client_reference_id: reservation.id,
        metadata: { reservation_id: reservation.id, transaction_type: 'reservation', ...(resolvedRoomId ? { space_room_id: resolvedRoomId } : {}) },
      }, { idempotencyKey: `reservation-checkout:${reservation.id}` })

      if (!session.url) throw new Error('Stripe não devolveu URL de checkout.')
      const { error: linkError } = await admin.from('reservations').update({ stripe_session_id: session.id }).eq('id', reservation.id)
      if (linkError) {
        if (session.status === 'open') await stripe.checkout.sessions.expire(session.id).catch(() => undefined)
        await admin.from('reservations').delete().eq('id', reservation.id).eq('status', 'pending').eq('payment_status', 'pending')
        throw new Error('Não foi possível associar o checkout à reserva.')
      }
      return NextResponse.json({ url: session.url })
    } catch (error) {
      await admin.from('reservations').delete().eq('id', reservation.id).eq('status', 'pending').eq('payment_status', 'pending')
      throw error
    }
  } catch (error) {
    console.error('Booking checkout error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro ao iniciar pagamento.' }, { status: 500 })
  }
}
