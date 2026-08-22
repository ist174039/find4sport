import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Building2, CalendarDays, Eye, MapPin, Star, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { setAdminSpaceStatusAction } from '../actions'

export default async function AdminSpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const { id } = await params
  const admin = createAdminClient()
  const { data: space, error } = await admin.from('sport_spaces').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Não foi possível carregar o espaço: ${error.message}`)
  if (!space) notFound()

  const [{ count: reservations }, { count: reviews }, { data: owner }] = await Promise.all([
    admin.from('reservations').select('id', { count: 'exact', head: true }).eq('space_id', id),
    admin.from('reviews').select('id', { count: 'exact', head: true }).eq('space_id', id),
    space.owner_user_id ? admin.from('platform_users').select('id,full_name,type').eq('id', space.owner_user_id).maybeSingle() : Promise.resolve({ data: null }),
  ])
  const active = space.status === 'active' && Boolean(space.is_verified)

  return <DashboardPage>
    <div><Button asChild variant="ghost" className="mb-2 min-h-11 px-2"><Link href="/admin/espacos"><ArrowLeft className="mr-2 h-4 w-4" />Espaços</Link></Button></div>
    <DashboardPageHeader title={space.name || 'Espaço'} description="Visão administrativa consolidada do espaço, gestão e atividade." action={<Button asChild variant="outline" className="min-h-11"><Link href={`/espacos/${space.slug || space.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Página pública</Link></Button>} />

    <DashboardStatGrid>
      <DashboardStat label="Reservas" value={reservations || 0} icon={<CalendarDays className="h-5 w-5" />} />
      <DashboardStat label="Avaliações" value={reviews || 0} hint={Number(space.review_count || 0) ? `${Number(space.rating_avg || 0).toFixed(1)} média` : 'Sem avaliações'} icon={<Star className="h-5 w-5" />} />
      <DashboardStat label="Gestão" value={owner ? 'Com gestor' : 'Sem gestor'} icon={<UserRound className="h-5 w-5" />} />
      <DashboardStat label="Estado" value={active ? 'Ativo' : 'Pendente'} icon={<Building2 className="h-5 w-5" />} />
    </DashboardStatGrid>

    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <DashboardSection title="Espaço" description="Informação operacional e pública disponível no registo.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border p-4 sm:col-span-2"><div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-4 w-4" />Localização</div><p className="mt-1 break-words font-medium">{space.address || '—'}</p></div>
          <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Estado</p><div className="mt-2 flex flex-wrap gap-2"><Badge variant="outline">{space.status || 'sem estado'}</Badge>{space.is_verified && <Badge>Verificado</Badge>}</div></div>
          <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Registo</p><p className="mt-1 font-medium">{space.created_at ? new Date(space.created_at).toLocaleString('pt-PT') : '—'}</p></div>
        </div>
      </DashboardSection>

      <DashboardSection title="Gestão" description="Estado e responsável pelo espaço.">
        <form action={async () => { 'use server'; await setAdminSpaceStatusAction(id, !active) }}><Button type="submit" variant={active ? 'destructive' : 'default'} className="min-h-11 w-full">{active ? 'Desativar espaço' : 'Ativar e verificar'}</Button></form>
        {owner ? <div className="mt-5 border-t pt-4"><div className="flex items-center gap-2 text-sm font-medium"><UserRound className="h-4 w-4" />Gestor associado</div><p className="mt-1 text-sm text-muted-foreground">{owner.full_name || owner.id}</p><Button asChild variant="outline" className="mt-3 min-h-11 w-full"><Link href={`/admin/utilizadores/${owner.id}`}>Ver conta do gestor</Link></Button></div> : <div className="mt-5 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Este espaço ainda não tem gestor associado. As reivindicações devem ser tratadas no módulo Reivindicações.</div>}
      </DashboardSection>
    </div>

    <DashboardSection title="Operação" description="Recursos associados ao espaço.">
      <div className="flex flex-wrap gap-2"><Button asChild variant="outline" className="min-h-11"><Link href={`/admin/reservas?q=${encodeURIComponent(space.name || id)}`}>Ver reservas</Link></Button><Button asChild variant="outline" className="min-h-11"><Link href={`/admin/avaliacoes?q=${encodeURIComponent(space.name || id)}`}>Ver avaliações</Link></Button><Button asChild variant="outline" className="min-h-11"><Link href="/admin/reivindicacoes">Reivindicações</Link></Button></div>
    </DashboardSection>
  </DashboardPage>
}
