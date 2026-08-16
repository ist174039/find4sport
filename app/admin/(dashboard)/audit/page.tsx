import { redirect } from 'next/navigation'
import { FileText, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

export default async function AdminAuditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('audit_logs')
    .select('id, action, table_name, user_email, user_id, new_data, created_at')
    .order('created_at', { ascending: false })
    .limit(250)

  if (error) throw error
  const logs = data || []

  return (
    <DashboardPage>
      <DashboardPageHeader title="Audit Log" description="Registo cronológico das ações administrativas persistidas. Não existem ações de edição ou eliminação neste ecrã." />
      <DashboardSection title="Últimas ações" description={`A apresentar os ${logs.length} registos mais recentes.`}>
        {logs.length === 0 ? <DashboardEmptyState icon={<FileText className="h-10 w-10" />} title="Sem registos" description="As ações administrativas auditadas aparecerão aqui." /> : <div className="space-y-3">{logs.map((log: any) => <article key={log.id} className="rounded-2xl border border-border p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{log.action}</Badge><span className="font-mono text-xs text-muted-foreground">{log.table_name || 'sistema'}</span></div><p className="mt-2 text-sm font-medium">{log.new_data?.action || 'Ação administrativa'}</p>{log.new_data && <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">{JSON.stringify(log.new_data, null, 2)}</pre>}</div><div className="shrink-0 text-left sm:text-right"><p className="flex items-center gap-1 text-xs font-semibold sm:justify-end"><Shield className="h-3.5 w-3.5" />{log.user_email || log.user_id || 'Sistema'}</p><time className="mt-1 block text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString('pt-PT')}</time></div></div></article>)}</div>}
      </DashboardSection>
    </DashboardPage>
  )
}
