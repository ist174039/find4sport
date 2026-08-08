import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientesInterface } from '@/components/dashboard/clientes-interface'

export default async function ClientesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Tenta obter o perfil do profissional
  const { data: professional } = await supabase
    .from('professionals')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const { data: spaces } = await supabase
    .from('sport_spaces')
    .select('id')
    .eq('owner_user_id', user.id)

  const clientMap = new Map<string, any>()

  // Build the client base from reservations because this table is present and operational.
  if (professional || (spaces && spaces.length > 0)) {
    const conditions: string[] = []
    if (professional?.id) {
      conditions.push(`professional_id.eq.${professional.id}`)
    }
    if (spaces && spaces.length > 0) {
      const spaceIds = spaces.map((s) => s.id).join(',')
      conditions.push(`space_id.in.(${spaceIds})`)
    }

    if (conditions.length > 0) {
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select('id, user_id, status, amount, date, created_at, user:platform_users!reservations_user_id_fkey(id, full_name, avatar_url)')
        .or(conditions.join(','))
        .order('created_at', { ascending: false })

      ;(reservationsData || []).forEach((reservation: any) => {
        const userInfo = reservation.user
        if (!userInfo?.id) return

        const existing = clientMap.get(userInfo.id)
        const when = reservation.created_at || reservation.date

        if (!existing) {
          clientMap.set(userInfo.id, {
            id: userInfo.id,
            name: userInfo.full_name || 'Cliente Sem Nome',
            email: 'Email privado',
            avatar: userInfo.avatar_url,
            total_bookings: 1,
            last_booking: when,
            last_status: reservation.status || 'pending',
            total_spent: Number(reservation.amount || 0),
            confirmed_count: reservation.status === 'confirmed' || reservation.status === 'paid' ? 1 : 0,
            completed_count: reservation.status === 'completed' ? 1 : 0,
            pending_count: reservation.status === 'pending' ? 1 : 0,
            cancelled_count: reservation.status === 'cancelled' ? 1 : 0,
          })
          return
        }

        existing.total_bookings += 1
        existing.total_spent += Number(reservation.amount || 0)
        if (reservation.status === 'confirmed' || reservation.status === 'paid') existing.confirmed_count += 1
        if (reservation.status === 'completed') existing.completed_count += 1
        if (reservation.status === 'pending') existing.pending_count += 1
        if (reservation.status === 'cancelled') existing.cancelled_count += 1

        if (new Date(when) > new Date(existing.last_booking)) {
          existing.last_booking = when
          existing.last_status = reservation.status || existing.last_status
        }
      })
    }
  }

  // Legacy fallback: if no reservations were found, try bookings for compatibility.
  if (clientMap.size === 0 && professional) {
    try {
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*, user:user_id(id, full_name, email, avatar_url)')
        .eq('professional_id', professional.id)

      if (bookingsData && !error) {
        bookingsData.forEach((booking: any) => {
          if (!booking.user) return
          const existing = clientMap.get(booking.user.id)
          if (!existing) {
            clientMap.set(booking.user.id, {
              id: booking.user.id,
              name: booking.user.full_name || 'Cliente Sem Nome',
              email: booking.user.email || 'Email privado',
              avatar: booking.user.avatar_url,
              total_bookings: 1,
              last_booking: booking.created_at,
              last_status: 'confirmed',
              total_spent: 0,
              confirmed_count: 1,
              completed_count: 0,
              pending_count: 0,
              cancelled_count: 0,
            })
            return
          }

          existing.total_bookings += 1
          if (new Date(booking.created_at) > new Date(existing.last_booking)) {
            existing.last_booking = booking.created_at
          }
        })
      }
    } catch {
      console.log('Tabela bookings não encontrada ou sem acesso.')
    }
  }

  const now = Date.now()
  const clientes = Array.from(clientMap.values())
    .map((client) => {
      const daysSinceLast = Math.floor((now - new Date(client.last_booking).getTime()) / (1000 * 60 * 60 * 24))
      let status = 'Ativo'
      if (client.total_bookings >= 6 || client.total_spent >= 300) {
        status = 'VIP'
      } else if (client.pending_count > 0) {
        status = 'Pendente'
      } else if (daysSinceLast > 90) {
        status = 'Inativo'
      }

      return {
        ...client,
        status,
      }
    })
    .sort((a, b) => new Date(b.last_booking).getTime() - new Date(a.last_booking).getTime())

  return (
    <ClientesInterface initialClientes={clientes} />
  )
}
