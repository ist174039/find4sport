import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AvailabilityClient } from './availability-client'

export default async function DisponibilidadePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get professional profile
  const { data: prof } = await supabase
    .from('professionals')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!prof) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Disponibilidade</h1>
        <p>Apenas os profissionais podem configurar disponibilidade diária. Se tem um Espaço, configure a disponibilidade nas definições das Salas.</p>
      </div>
    )
  }

  // Get existing availability
  const { data: availability } = await supabase
    .from('professional_availability')
    .select('*')
    .eq('professional_id', prof.id)
    .order('day_of_week', { ascending: true })

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerir Disponibilidade</h1>
          <p className="text-muted-foreground mt-1">
            Defina o seu horário de trabalho para cada dia da semana.
          </p>
        </div>
      </div>

      <AvailabilityClient 
        initialAvailability={availability || []} 
        professionalId={prof.id} 
      />
    </div>
  )
}
