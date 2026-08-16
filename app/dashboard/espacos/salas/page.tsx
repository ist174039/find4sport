import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SpaceRoomsClient } from './space-rooms-client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { getLimit } from '@/lib/billing/entitlements'

export default async function SalasPage({ searchParams }: { searchParams: Promise<{ space?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/espacos/salas')

  const params = await searchParams
  const { data: spaces, error: spacesError } = await supabase
    .from('sport_spaces')
    .select('id,name,slug,address')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: true })
  if (spacesError) throw new Error(`Não foi possível carregar os espaços: ${spacesError.message}`)

  if (!spaces?.length) {
    return <div className="rounded-2xl border border-dashed bg-card p-10 text-center"><h1 className="text-2xl font-bold">Salas e campos</h1><p className="mt-2 text-sm text-muted-foreground">Não existe nenhum espaço associado a esta conta.</p><Link href="/dashboard/espaco" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Gerir espaços</Link></div>
  }

  const selectedSpace = spaces.find(space => space.id === params.space) || spaces[0]
  const [{ data: rooms, error: roomsError }, maxPhotos] = await Promise.all([
    supabase.from('space_rooms').select('*').eq('space_id', selectedSpace.id).order('created_at', { ascending: false }),
    getLimit(user.id, 'profile.photos.max'),
  ])
  if (roomsError) throw new Error(`Não foi possível carregar as salas/campos: ${roomsError.message}`)

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Salas e campos</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Inventário reservável do espaço selecionado.</p>
      </div>

      {spaces.length > 1 && (
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex w-max gap-2">
            {spaces.map(space => <Link key={space.id} href={`/dashboard/espacos/salas?space=${space.id}`} className={`flex min-h-10 items-center rounded-full border px-4 text-sm font-medium ${space.id === selectedSpace.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground'}`}>{space.name}</Link>)}
          </div>
        </div>
      )}

      <Alert className="border-primary/20 bg-primary/5 text-primary">
        <Info className="h-4 w-4" />
        <AlertTitle>{selectedSpace.name}</AlertTitle>
        <AlertDescription className="text-sm leading-relaxed">Preço, disponibilidade e fotografias são configurados por sala/campo. As taxas de pagamento são calculadas apenas no checkout.</AlertDescription>
      </Alert>

      <SpaceRoomsClient initialRooms={(rooms || []) as any} spaceId={selectedSpace.id} maxPhotos={maxPhotos} />
    </div>
  )
}
