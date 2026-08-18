import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AvailabilityClient } from './availability-client'

export default async function DisponibilidadePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: prof } = await supabase
    .from('professionals')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!prof) {
    return (
      <div className="p-8">
        <h1 className="mb-4 text-2xl font-bold">Disponibilidade</h1>
        <p>Apenas os profissionais podem configurar disponibilidade diária. Se tem um Espaço, configure a disponibilidade nas definições das Salas.</p>
      </div>
    )
  }

  const { data: availability } = await supabase
    .from('professional_availability')
    .select('*')
    .eq('professional_id', prof.id)
    .order('day_of_week', { ascending: true })

  const normalizedAvailability = (availability || []).map(slot => ({
    id: slot.id,
    professional_id: slot.professional_id ?? undefined,
    day_of_week: slot.day_of_week,
    start_time: slot.start_time,
    end_time: slot.end_time,
    is_active: Boolean(slot.is_active),
  }))

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerir Disponibilidade</h1>
          <p className="mt-1 text-muted-foreground">Defina o seu horário de trabalho para cada dia da semana.</p>
        </div>
      </div>

      <AvailabilityClient initialAvailability={normalizedAvailability} professionalId={prof.id} />
    </div>
  )
}
