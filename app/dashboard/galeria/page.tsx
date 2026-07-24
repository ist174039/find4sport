import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GaleriaManager } from '@/components/dashboard/galeria-manager'

export default async function GaleriaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard/galeria')
  }

  // Check if professional
  const { data: prof } = await supabase
    .from('professionals')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Check if space owner
  const { data: space } = await supabase
    .from('sport_spaces')
    .select('*')
    .eq('owner_user_id', user.id)
    .maybeSingle()

  const entity = prof ? { type: 'professional', data: prof } : space ? { type: 'space', data: space } : null

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Galeria de Fotos</h1>
        <p className="text-muted-foreground mt-1">
          Gira e atualiza a galeria de imagens do teu perfil e instalações.
        </p>
      </div>

      <GaleriaManager initialEntity={entity} />
    </div>
  )
}
