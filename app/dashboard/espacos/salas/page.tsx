import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SpaceRoomsClient } from './space-rooms-client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export default async function SalasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: space } = await supabase
    .from('sport_spaces')
    .select('*')
    .or(`owner_user_id.eq.${user.id},created_by.eq.${user.id}`)
    .maybeSingle()

  if (!space) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Salas e Campos</h1>
        <p className="text-sm text-muted-foreground">Não tem nenhum espaço desportivo associado a esta conta.</p>
      </div>
    )
  }

  const [{ data: rooms }, { data: sub }] = await Promise.all([
    supabase.from('space_rooms').select('*').eq('space_id', space.id).order('created_at', { ascending: false }),
    supabase.from('user_subscriptions').select('tier').eq('user_id', user.id).maybeSingle(),
  ])

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Salas e Campos</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Gira os sub-espaços disponíveis para reserva, como campos, salas e estúdios.</p>
      </div>

      <Alert className="border-primary/20 bg-primary/5 text-primary">
        <Info className="h-4 w-4" />
        <AlertTitle>Pagamentos de reservas</AlertTitle>
        <AlertDescription className="text-sm leading-relaxed">
          Quando uma sala tem preço definido, as taxas aplicáveis ao pagamento são apresentadas e processadas no fluxo de checkout.
        </AlertDescription>
      </Alert>

      <SpaceRoomsClient
        initialRooms={rooms || []}
        spaceId={space.id}
        userId={user.id}
        subscriptionTier={sub?.tier || 'free'}
      />
    </div>
  )
}
