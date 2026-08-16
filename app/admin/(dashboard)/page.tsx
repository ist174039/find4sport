import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, ArrowRight, Building2, Calendar, Flag, ShieldAlert, Star, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const admin = createAdminClient()
  const [usersResult, professionalsResult, spacesResult, eventsResult, reviewsResult, claimsResult, reportsResult, auditResult] = await Promise.all([
    admin.from('platform_users').select('id', { count: 'exact', head: true }),
    admin.from('professionals').select('id', { count: 'exact', head: true }),
    admin.from('sport_spaces').select('id', { count: 'exact', head: true }),
    admin.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    admin.from('reviews').select('id', { count: 'exact', head: true }).lte('rating', 2),
    admin.from('space_claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('content_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('audit_logs').select('id, action, table_name, user_email, new_data, created_at').order('created_at', { ascending: false }).limit(8),
  ])

  const pendingReports = reportsResult.error ? null : reportsResult.count || 0
  const auditLogs = auditResult.data || []

  const attention = [
    { title: 'Denúncias pendentes', value: pendingReports, href: '/admin/moderacao', icon: Flag, description: pendingReports === null ? 'Módulo de denúncias ainda não disponível na base de dados.' : 'Conteúdo reportado a aguardar decisão.' },
    { title: 'Reivindicações', value: claimsResult.count || 0, href: '/admin/reivindicacoes', icon: ShieldAlert, description: 'Pedidos de propriedade de espaços a aguardar validação.' },
    { title: 'Avaliações ≤ 2', value: reviewsResult.count || 0, href: '/admin/avaliacoes', icon: Star, description: 'Indicador de reputação; não é uma denúncia de conteúdo.' },
  ]

  return (
    <DashboardPage>
      <DashboardPageHeader title="Dashboard Admin" description="Visão operacional curta, construída apenas com dados persistidos e pendências que exigem ação." />

      <DashboardStatGrid>
        <DashboardStat label="Utilizadores" value={usersResult.count || 0} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Profissionais" value={professionalsResult.count || 0} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Espaços" value={spacesResult.count || 0} icon={<Building2 className="h-5 w-5" />} />
        <DashboardStat label="Eventos publicados" value={eventsResult.count || 0} icon={<Calendar className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection title="Requer atenção" description="Cada indicador aponta para o módulo responsável; reputação e moderação permanecem separados.">
        <div className="grid gap-3 md:grid-cols-3">
          {attention.map(item => <Link key={item.href} href={item.href} className="group rounded-2xl border border-border p-4 transition-colors hover:bg-muted/40"><div className="flex items-start justify-between gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><item.icon className="h-5 w-5" /></div><ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></div><p className="mt-4 text-2xl font-bold">{item.value === null ? '—' : item.value}</p><p className="mt-1 text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p></Link>)}
        </div>
      </DashboardSection>

      <DashboardSection title="Atividade administrativa recente" description="Últimos registos persistidos em audit_logs.">
        {auditLogs.length === 0 ? <DashboardEmptyState icon={<AlertTriangle className="h-10 w-10" />} title="Sem atividade registada" description="As ações administrativas auditadas aparecerão aqui." /> : <div className="space-y-3">{auditLogs.map((log: any) => <article key={log.id} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{log.action}</Badge><span className="font-mono text-xs text-muted-foreground">{log.table_name}</span></div><p className="mt-1 truncate text-sm">{log.new_data?.action || 'Ação administrativa'}</p><p className="text-xs text-muted-foreground">{log.user_email || 'Sistema'}</p></div><time className="shrink-0 text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString('pt-PT')}</time></article>)}</div>}
        <div className="mt-4"><Button asChild variant="outline" className="min-h-11 w-full sm:w-auto"><Link href="/admin/audit">Ver auditoria completa<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
      </DashboardSection>
    </DashboardPage>
  )
}
