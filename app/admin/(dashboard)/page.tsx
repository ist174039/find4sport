import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, ArrowRight, Building2, Calendar, CreditCard, Flag, RefreshCcw, ShieldAlert, Star, UserCheck, Users, WalletCards } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardEmptyState, DashboardErrorState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

function queryFailure(label: string, result: { error?: { message?: string } | null }) {
  return result.error ? `${label}: ${result.error.message || 'erro desconhecido'}` : null
}

function auditMessage(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'action' in value) {
    return String((value as { action?: unknown }).action || 'Ação administrativa')
  }
  return 'Ação administrativa'
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const admin = createAdminClient()
  const requestTime = new Date()
  const staleThreshold = new Date(requestTime)
  staleThreshold.setMinutes(staleThreshold.getMinutes() - 30)
  const stalePending = staleThreshold.toISOString()

  const [
    usersResult,
    professionalsResult,
    spacesResult,
    eventsResult,
    reviewsResult,
    claimsResult,
    reportsResult,
    auditResult,
    failedTx,
    refunds,
    disputes,
    pendingBookings,
    pendingChanges,
    prosNoStripe,
    spacesNoStripe,
  ] = await Promise.all([
    admin.from('platform_users').select('id', { count: 'exact', head: true }),
    admin.from('professionals').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('sport_spaces').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published').gte('start_date', requestTime.toISOString()),
    admin.from('reviews').select('id', { count: 'exact', head: true }).lte('rating', 2),
    admin.from('space_claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('content_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('audit_logs').select('id,action,table_name,user_email,new_data,created_at').order('created_at', { ascending: false }).limit(8),
    admin.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
    admin.from('transactions').select('id', { count: 'exact', head: true }).eq('type', 'refund'),
    admin.from('transactions').select('id', { count: 'exact', head: true }).eq('type', 'dispute').neq('status', 'won'),
    admin.from('reservations').select('id', { count: 'exact', head: true }).eq('status', 'pending').lt('created_at', stalePending),
    admin.from('reservation_change_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('professionals').select('id', { count: 'exact', head: true }).eq('status', 'active').is('stripe_account_id', null),
    admin.from('sport_spaces').select('id', { count: 'exact', head: true }).eq('status', 'active').not('owner_user_id', 'is', null).is('stripe_account_id', null),
  ])

  const primaryFailures = [
    queryFailure('utilizadores', usersResult),
    queryFailure('profissionais', professionalsResult),
    queryFailure('espaços', spacesResult),
    queryFailure('eventos', eventsResult),
    queryFailure('avaliações', reviewsResult),
    queryFailure('reivindicações', claimsResult),
    queryFailure('denúncias', reportsResult),
    queryFailure('audit log', auditResult),
    queryFailure('pagamentos falhados', failedTx),
    queryFailure('reembolsos', refunds),
    queryFailure('disputas', disputes),
    queryFailure('reservas pendentes', pendingBookings),
    queryFailure('alterações de reserva', pendingChanges),
    queryFailure('profissionais sem Stripe', prosNoStripe),
    queryFailure('espaços sem Stripe', spacesNoStripe),
  ].filter(Boolean) as string[]

  if (primaryFailures.length > 0) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="Dashboard Admin" description="Consola de exceções operacionais da plataforma." />
        <DashboardErrorState
          title="Os indicadores administrativos não são confiáveis neste momento"
          description={`Uma ou mais consultas falharam e os valores não foram substituídos por zero. ${primaryFailures.slice(0, 3).join(' · ')}${primaryFailures.length > 3 ? ` · +${primaryFailures.length - 3} erro(s)` : ''}`}
        />
      </DashboardPage>
    )
  }

  const [activeProsResult, activeSpacesResult] = await Promise.all([
    admin.from('professionals').select('user_id').eq('status', 'active'),
    admin.from('sport_spaces').select('owner_user_id').eq('status', 'active').not('owner_user_id', 'is', null),
  ])

  const providerFailures = [
    queryFailure('identidades profissionais', activeProsResult),
    queryFailure('identidades de gestores', activeSpacesResult),
  ].filter(Boolean) as string[]

  if (providerFailures.length > 0) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="Dashboard Admin" description="Consola de exceções operacionais da plataforma." />
        <DashboardErrorState title="Não foi possível validar a identidade dos prestadores" description={providerFailures.join(' · ')} />
      </DashboardPage>
    )
  }

  const activePros = activeProsResult.data || []
  const activeSpaces = activeSpacesResult.data || []
  const providerIds = [...new Set([
    ...activePros.map(item => item.user_id),
    ...activeSpaces.map(item => item.owner_user_id),
  ].filter((value): value is string => Boolean(value)))]

  const providerProfilesResult = providerIds.length
    ? await admin.from('platform_users').select('id,type').in('id', providerIds)
    : { data: [] as Array<{ id: string; type: string | null }>, error: null }

  if (providerProfilesResult.error) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="Dashboard Admin" description="Consola de exceções operacionais da plataforma." />
        <DashboardErrorState title="Não foi possível validar os roles dos prestadores" description={providerProfilesResult.error.message} />
      </DashboardPage>
    )
  }

  const roles = new Map((providerProfilesResult.data || []).map(item => [item.id, item.type]))
  const identityMismatch = activePros.filter(item => roles.get(item.user_id) !== 'professional').length
    + activeSpaces.filter(item => item.owner_user_id && roles.get(item.owner_user_id) !== 'venue_manager').length

  const exceptions = [
    { title: 'Pagamentos falhados', value: failedTx.count ?? 0, href: '/admin/faturacao', icon: CreditCard, critical: true, description: 'Movimentos financeiros com estado failed.' },
    { title: 'Disputas abertas', value: disputes.count ?? 0, href: '/admin/faturacao', icon: ShieldAlert, critical: true, description: 'Chargebacks/disputas que ainda exigem acompanhamento.' },
    { title: 'Reembolsos', value: refunds.count ?? 0, href: '/admin/faturacao', icon: RefreshCcw, description: 'Movimentos de refund registados no ledger.' },
    { title: 'Reservas pendentes >30m', value: pendingBookings.count ?? 0, href: '/admin/faturacao', icon: Calendar, critical: true, description: 'Reservas que podem ter checkout abandonado ou estado preso.' },
    { title: 'Alterações por decidir', value: pendingChanges.count ?? 0, href: '/admin/audit', icon: Calendar, description: 'Pedidos de alteração de reserva ainda pendentes.' },
    { title: 'Profissionais sem Stripe', value: prosNoStripe.count ?? 0, href: '/admin/profissionais', icon: WalletCards, description: 'Ativos publicamente, mas incapazes de receber pagamentos.' },
    { title: 'Espaços sem Stripe', value: spacesNoStripe.count ?? 0, href: '/admin/espacos', icon: WalletCards, description: 'Espaços ativos sem conta Connect configurada.' },
    { title: 'Identidade incompatível', value: identityMismatch, href: '/admin/utilizadores', icon: UserCheck, critical: true, description: 'Entidade ativa cujo role não corresponde ao tipo de prestador.' },
  ]

  const moderation = [
    { title: 'Denúncias pendentes', value: reportsResult.count ?? 0, href: '/admin/moderacao', icon: Flag },
    { title: 'Reivindicações', value: claimsResult.count ?? 0, href: '/admin/reivindicacoes', icon: ShieldAlert },
    { title: 'Avaliações ≤ 2', value: reviewsResult.count ?? 0, href: '/admin/avaliacoes', icon: Star },
  ]
  const auditLogs = auditResult.data || []

  return (
    <DashboardPage>
      <DashboardPageHeader title="Dashboard Admin" description="Consola de exceções operacionais: o que pode bloquear dinheiro, reservas, confiança ou publicação aparece primeiro." />
      <DashboardStatGrid>
        <DashboardStat label="Utilizadores" value={usersResult.count ?? 0} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Profissionais ativos" value={professionalsResult.count ?? 0} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Espaços ativos" value={spacesResult.count ?? 0} icon={<Building2 className="h-5 w-5" />} />
        <DashboardStat label="Eventos futuros" value={eventsResult.count ?? 0} icon={<Calendar className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection title="Exceções operacionais" description="Valores diferentes de zero devem ser tratados como fila de trabalho, não como KPI decorativo.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {exceptions.map(item => (
            <Link key={item.title} href={item.href} className={`group rounded-2xl border p-4 transition hover:bg-muted/40 ${item.critical && item.value > 0 ? 'border-destructive/35 bg-destructive/[0.03]' : 'border-border'}`}>
              <div className="flex items-start justify-between"><div className="rounded-xl bg-primary/10 p-3 text-primary"><item.icon className="h-5 w-5" /></div><ArrowRight className="h-4 w-4 text-muted-foreground" /></div>
              <p className="mt-4 text-2xl font-bold">{item.value}</p>
              <p className="mt-1 text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
            </Link>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection title="Confiança e moderação">
        <div className="grid gap-3 md:grid-cols-3">
          {moderation.map(item => (
            <Link key={item.href} href={item.href} className="rounded-2xl border p-4 hover:bg-muted/40">
              <div className="flex items-center justify-between"><item.icon className="h-5 w-5 text-primary" /><ArrowRight className="h-4 w-4 text-muted-foreground" /></div>
              <p className="mt-4 text-2xl font-bold">{item.value}</p>
              <p className="mt-1 text-sm font-semibold">{item.title}</p>
            </Link>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection title="Atividade administrativa recente" description="Últimos registos persistidos em audit_logs.">
        {auditLogs.length === 0 ? (
          <DashboardEmptyState icon={<AlertTriangle className="h-10 w-10" />} title="Sem atividade registada" description="As ações administrativas auditadas aparecerão aqui." />
        ) : (
          <div className="space-y-3">
            {auditLogs.map(log => (
              <article key={log.id} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{log.action}</Badge><span className="font-mono text-xs text-muted-foreground">{log.table_name}</span></div>
                  <p className="mt-1 truncate text-sm">{auditMessage(log.new_data)}</p>
                  <p className="text-xs text-muted-foreground">{log.user_email || 'Sistema'}</p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">{log.created_at ? new Date(log.created_at).toLocaleString('pt-PT') : '—'}</time>
              </article>
            ))}
          </div>
        )}
        <div className="mt-4"><Button asChild variant="outline"><Link href="/admin/audit">Ver auditoria completa<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
      </DashboardSection>
    </DashboardPage>
  )
}
