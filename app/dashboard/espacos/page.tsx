import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ExternalLink, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

type Association = {
  space_id: string
  space_name: string
  space_address: string | null
  space_slug: string | null
  role: 'owner' | 'professional'
}

export default async function DashboardEspacosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/espacos')

  const { data: ownedSpaces, error: ownedError } = await supabase
    .from('sport_spaces')
    .select('id,name,address,slug')
    .eq('owner_user_id', user.id)
    .order('name')
  if (ownedError) throw new Error('Não foi possível carregar os espaços geridos.')

  const associations: Association[] = (ownedSpaces || []).map(space => ({
    space_id: space.id,
    space_name: space.name,
    space_address: space.address,
    space_slug: space.slug,
    role: 'owner',
  }))

  const { data: professional } = await supabase
    .from('professionals')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (professional) {
    const { data: relations, error: relationError } = await supabase
      .from('space_professionals')
      .select('space_id')
      .eq('professional_id', professional.id)
      .eq('status', 'active')
    if (relationError) throw new Error('Não foi possível carregar as associações a espaços.')

    const associatedIds = (relations || []).map(row => row.space_id).filter(id => !associations.some(item => item.space_id === id))
    if (associatedIds.length) {
      const { data: spaces, error: spacesError } = await supabase
        .from('sport_spaces')
        .select('id,name,address,slug')
        .in('id', associatedIds)
        .order('name')
      if (spacesError) throw new Error('Não foi possível carregar os espaços associados.')
      for (const space of spaces || []) associations.push({
        space_id: space.id,
        space_name: space.name,
        space_address: space.address,
        space_slug: space.slug,
        role: 'professional',
      })
    }
  }

  return <DashboardPage>
    <DashboardPageHeader title="Espaços" description="Espaços que geres e espaços onde tens uma associação profissional ativa." />
    <DashboardSection title="Relações com espaços" description="Associações pendentes ou recusadas não são apresentadas como colaboração ativa.">
      {associations.length === 0 ? <DashboardEmptyState icon={<MapPin className="h-10 w-10" />} title="Nenhum espaço associado" description="Ainda não geres nem colaboras oficialmente com um espaço desportivo." /> : <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {associations.map(association => <Card key={`${association.role}-${association.space_id}`} className="min-w-0"><CardContent className="p-4 sm:p-5"><div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-semibold">{association.space_name}</h3>{association.space_address && <p className="mt-1 flex min-w-0 items-start gap-1.5 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="line-clamp-2">{association.space_address}</span></p>}</div><Badge variant="outline" className="shrink-0">{association.role === 'owner' ? 'Gestor' : 'Profissional'}</Badge></div><Button asChild variant="outline" className="mt-4 min-h-11 w-full"><Link href={`/espacos/${association.space_slug || association.space_id}`}><ExternalLink className="mr-2 h-4 w-4" />Ver espaço</Link></Button></CardContent></Card>)}
      </div>}
    </DashboardSection>
  </DashboardPage>
}
