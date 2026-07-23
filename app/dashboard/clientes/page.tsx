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

  let clientes = []

  // Se for profissional, tenta obter clientes através de bookings ou de uma tabela própria.
  // Como a tabela exata depende do schema (bookings, professional_clients, etc), 
  // começamos com um array vazio se falhar, para não quebrar a página.
  if (professional) {
    try {
      // Tenta bookings (assumindo que bookings tem user_id ou client_id e professional_id)
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*, user:user_id(id, full_name, email, avatar_url)')
        .eq('professional_id', professional.id)
      
      if (bookingsData && !error) {
        // Extrai clientes únicos
        const clientMap = new Map()
        bookingsData.forEach((booking: any) => {
          if (booking.user && !clientMap.has(booking.user.id)) {
            clientMap.set(booking.user.id, {
              id: booking.user.id,
              name: booking.user.full_name || 'Cliente Sem Nome',
              email: booking.user.email,
              avatar: booking.user.avatar_url,
              total_bookings: 1,
              last_booking: booking.created_at,
              status: 'Ativo'
            })
          } else if (booking.user) {
            const c = clientMap.get(booking.user.id)
            c.total_bookings += 1
            if (new Date(booking.created_at) > new Date(c.last_booking)) {
              c.last_booking = booking.created_at
            }
          }
        })
        clientes = Array.from(clientMap.values())
      }
    } catch (e) {
      console.log('Tabela bookings não encontrada ou sem acesso.')
    }
  }

  return (
    <ClientesInterface initialClientes={clientes} />
  )
}
