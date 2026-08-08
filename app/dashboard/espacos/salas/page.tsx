import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SpaceRoomsClient } from './space-rooms-client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export default async function SalasPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get the space for this user
  const { data: space } = await supabase
    .from('sport_spaces')
    .select('*')
    .or(`owner_user_id.eq.${user.id},created_by.eq.${user.id}`)
    .maybeSingle()

  if (!space) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Salas e Campos</h1>
        <p>Não tem nenhum espaço desportivo associado a esta conta.</p>
      </div>
    )
  }

  // Get existing rooms
  const { data: rooms } = await supabase
    .from('space_rooms')
    .select('*')
    .eq('space_id', space.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salas e Campos</h1>
          <p className="text-muted-foreground mt-1">
            Gira os sub-espaços (ex: Campo de Padel, Sala de Dança) disponíveis para reserva.
          </p>
        </div>
      </div>

      <Alert className="bg-primary/5 text-primary border-primary/20">
        <Info className="h-4 w-4" />
        <AlertTitle>Taxas da Plataforma e Stripe</AlertTitle>
        <AlertDescription>
          Para todas as salas com um preço definido (valor &gt; 0), aplicam-se as taxas da plataforma (3.5%) e as taxas standard de processamento do Stripe (aprox. 1.5% + 0.25€) sobre cada transação. O valor será deduzido automaticamente aquando do pagamento pelo cliente.
        </AlertDescription>
      </Alert>

      <SpaceRoomsClient 
        initialRooms={rooms || []} 
        spaceId={space.id} 
      />
    </div>
  )
}
