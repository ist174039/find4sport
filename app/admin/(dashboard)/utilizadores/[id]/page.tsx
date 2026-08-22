import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Ban, CalendarDays, Mail, RotateCcw, ShieldCheck, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess, getAccountStatus } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'
import { setPlatformUserSuspensionAction } from '../actions'

const roleLabels: Record<string, string> = { athlete: 'Atleta', professional: 'Profissional', venue_manager: 'Gestor de espaço' }
const statusLabels: Record<string, string> = { suspended: 'Suspensa', deactivated: 'Desativada', deletion_requested: 'Eliminação solicitada' }

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user: actor } } = await supabase.auth.getUser()
  if (!actor) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, actor)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const { id } = await params
  const admin = createAdminClient()
  const [{ data: profile }, { data: authResult }] = await Promise.all([
    admin.from('platform_users').select('id,full_name,type,avatar_url,created_at,updated_at').eq('id', id).maybeSingle(),
    admin.auth.admin.getUserById(id),
  ])
  if (!profile || !authResult?.user) notFound()

  const accountStatus = getAccountStatus(authResult.user) || 'active'
  const isSuspended = accountStatus === 'suspended'
  const canToggleSuspension = accountStatus === 'active' || accountStatus === 'suspended'

  const [{ count: reservations }, { count: transactions }, { count: reviews }, { data: professional }, { data: spaces }] = await Promise.all([
    admin.from('reservations').select('id', { count: 'exact', head: true }).eq('user_id', id),
    admin.from('transactions').select('id', { count: 'exact', head: true }).eq('user_id', id),
    admin.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', id),
    admin.from('professionals').select('id,slug').eq('user_id', id).maybeSingle(),
    admin.from('sport_spaces').select('id,slug,name').eq('owner_user_id', id).limit(5),
  ])

  return <DashboardPage>
    <div><Button asChild variant="ghost" className="mb-2 min-h-11 px-2"><Link href="/admin/utilizadores"><ArrowLeft className="mr-2 h-4 w-4" />Utilizadores</Link></Button></div>
    <DashboardPageHeader title={profile.full_name || authResult.user.email || 'Utilizador'} description="Detalhe administrativo da conta, estado de acesso e atividade associada." />

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <DashboardSection title="Conta" description="Dados de perfil e autenticação.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" />Email</div><p className="mt-2 break-all font-medium">{authResult.user.email || '—'}</p></div>
          <div className="rounded-xl border p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><UserRound className="h-4 w-4" />Tipo</div><p className="mt-2 font-medium">{roleLabels[profile.type || ''] || profile.type || '—'}</p></div>
          <div className="rounded-xl border p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4" />Estado</div><div className="mt-2"><Badge variant={accountStatus === 'active' ? 'default' : 'outline'}>{accountStatus === 'active' ? 'Ativa' : statusLabels[accountStatus] || accountStatus}</Badge></div></div>
          <div className="rounded-xl border p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" />Registo</div><p className="mt-2 font-medium">{profile.created_at ? new Date(profile.created_at).toLocaleString('pt-PT') : '—'}</p></div>
        </div>
      </DashboardSection>

      <DashboardSection title="Ações de conta" description="Operações auditadas e reversíveis.">
        {canToggleSuspension ? <form action={async () => { 'use server'; await setPlatformUserSuspensionAction(id, !isSuspended) }}><Button type="submit" variant={isSuspended ? 'default' : 'destructive'} className="min-h-11 w-full">{isSuspended ? <RotateCcw className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}{isSuspended ? 'Reativar conta' : 'Suspender conta'}</Button></form> : <p className="text-sm text-muted-foreground">Este estado é gerido pelo processo de lifecycle do próprio utilizador e não deve ser sobrescrito por uma suspensão administrativa.</p>}
      </DashboardSection>
    </div>

    <DashboardSection title="Atividade associada" description="Indicadores para decisão administrativa sem eliminar histórico.">
      <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border p-4"><p className="text-sm text-muted-foreground">Reservas</p><p className="mt-1 text-2xl font-bold">{reservations || 0}</p></div><div className="rounded-xl border p-4"><p className="text-sm text-muted-foreground">Transações</p><p className="mt-1 text-2xl font-bold">{transactions || 0}</p></div><div className="rounded-xl border p-4"><p className="text-sm text-muted-foreground">Avaliações</p><p className="mt-1 text-2xl font-bold">{reviews || 0}</p></div></div>
      <div className="mt-4 flex flex-wrap gap-2">{professional && <Button asChild variant="outline" className="min-h-11"><Link href={`/admin/profissionais?q=${encodeURIComponent(profile.full_name || id)}`}>Ver perfil profissional</Link></Button>}{(spaces || []).map(space => <Button key={space.id} asChild variant="outline" className="min-h-11"><Link href={`/admin/espacos?q=${encodeURIComponent(space.name || space.id)}`}>Espaço: {space.name || space.id}</Link></Button>)}</div>
    </DashboardSection>
  </DashboardPage>
}
