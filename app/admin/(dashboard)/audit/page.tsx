import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FileText, Search, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

const PAGE_SIZE = 25

function href(page: number, q: string, action: string) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (q) params.set('q', q)
  if (action !== 'all') params.set('action', action)
  return `/admin/audit${params.toString() ? `?${params}` : ''}`
}

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const params = await searchParams
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1)
  const q = String(Array.isArray(params.q) ? params.q[0] : params.q || '').trim().replace(/[,%]/g,'').slice(0,100)
  const rawAction = String(Array.isArray(params.action) ? params.action[0] : params.action || 'all')
  const action = ['INSERT','UPDATE','DELETE'].includes(rawAction) ? rawAction : 'all'
  const admin = createAdminClient()
  let query = admin.from('audit_logs').select('id, action, table_name, user_email, user_id, new_data, created_at', { count:'exact' }).order('created_at',{ascending:false})
  if (action !== 'all') query = query.eq('action',action)
  if (q) query = query.or(`table_name.ilike.%${q}%,user_email.ilike.%${q}%`)
  const from = (page-1)*PAGE_SIZE
  const { data, count, error } = await query.range(from,from+PAGE_SIZE-1)
  if (error) throw error
  const logs = data || []
  const total = count || 0
  const totalPages = Math.max(1,Math.ceil(total/PAGE_SIZE))

  return <DashboardPage>
    <DashboardPageHeader title="Audit Log" description="Registo cronológico, pesquisável e paginado das ações administrativas persistidas." />
    <DashboardSection title="Ações auditadas" description="Filtro por tipo de ação, tabela ou administrador.">
      <form method="get" className="mb-4 grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_180px_auto]"><label className="relative min-w-0"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input name="q" defaultValue={q} placeholder="Tabela ou administrador" className="min-h-11 w-full pl-10"/></label><select name="action" defaultValue={action} className="min-h-11 rounded-lg border border-input bg-background px-3"><option value="all">Todas as ações</option><option value="INSERT">INSERT</option><option value="UPDATE">UPDATE</option><option value="DELETE">DELETE</option></select><Button type="submit" className="min-h-11">Filtrar</Button></form>
      {logs.length===0?<DashboardEmptyState icon={<FileText className="h-10 w-10"/>} title="Sem registos" description="Não existem ações para os filtros selecionados."/>:<div className="space-y-3">{logs.map((log:any)=><article key={log.id} className="min-w-0 rounded-2xl border p-4"><div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{log.action}</Badge><span className="break-all font-mono text-xs text-muted-foreground">{log.table_name||'sistema'}</span></div><p className="mt-2 break-words text-sm font-medium">{log.new_data?.action||'Ação administrativa'}</p>{log.new_data&&<pre className="mt-2 max-h-40 max-w-full overflow-auto whitespace-pre-wrap break-all rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">{JSON.stringify(log.new_data,null,2)}</pre>}</div><div className="shrink-0 text-left sm:text-right"><p className="flex max-w-full items-center gap-1 break-all text-xs font-semibold sm:justify-end"><Shield className="h-3.5 w-3.5 shrink-0"/>{log.user_email||log.user_id||'Sistema'}</p><time className="mt-1 block text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString('pt-PT')}</time></div></div></article>)}</div>}
      {total>0&&<div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">{from+1}–{Math.min(from+PAGE_SIZE,total)} de {total}</p><div className="flex items-center gap-2"><Button asChild variant="outline" size="sm" className={page<=1?'pointer-events-none opacity-50':''}><Link href={href(page-1,q,action)}>Anterior</Link></Button><span className="text-sm">{page}/{totalPages}</span><Button asChild variant="outline" size="sm" className={page>=totalPages?'pointer-events-none opacity-50':''}><Link href={href(page+1,q,action)}>Seguinte</Link></Button></div></div>}
    </DashboardSection>
  </DashboardPage>
}
