import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarCheck, ReceiptText, Search, UsersRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

export default async function AdminEventManagersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user); if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')
  const { q = '' } = await searchParams; const search = q.trim().replace(/[,%]/g, ' ').slice(0, 100); const admin = createAdminClient()
  let query = admin.from('platform_users').select('id,full_name,created_at,account_status,moderation_reason,suspended_until').eq('type', 'event_manager').order('created_at', { ascending: false })
  if (search) query = query.ilike('full_name', `%${search}%`)
  const { data: managers, error } = await query; if (error) throw new Error(`Não foi possível carregar gestores de eventos: ${error.message}`)
  const ids = (managers || []).map(item => item.id)
  const [{ data: events }, { data: communities }, { data: subscriptions }, { data: plan }] = await Promise.all([
    ids.length ? admin.from('events').select('id,created_by,status').in('created_by', ids) : Promise.resolve({ data: [] }),
    ids.length ? admin.from('communities').select('id,created_by,status').in('created_by', ids) : Promise.resolve({ data: [] }),
    ids.length ? admin.from('user_subscriptions').select('user_id,status,tier,plan_id').in('user_id', ids) : Promise.resolve({ data: [] }),
    admin.from('subscription_plans').select('id,name,commission_rate').eq('audience', 'event_manager').eq('code', 'free').maybeSingle(),
  ])
  const countFor = (rows: Array<{ created_by: string | null }> | null, id: string) => (rows || []).filter(row => row.created_by === id).length
  const active = (managers || []).filter(item => item.account_status === 'active').length
  return <DashboardPage><DashboardPageHeader title="Gestores de Eventos" description="Contas especializadas em eventos e comunidades, com plano e comissão próprios." action={<Button asChild variant="outline"><Link href="/admin/planos">Editar plano</Link></Button>}/><DashboardStatGrid><DashboardStat label="Gestores" value={(managers || []).length} icon={<CalendarCheck className="h-5 w-5"/>}/><DashboardStat label="Ativos" value={active} icon={<CalendarCheck className="h-5 w-5"/>}/><DashboardStat label="Eventos" value={(events || []).length} icon={<CalendarCheck className="h-5 w-5"/>}/><DashboardStat label="Comunidades" value={(communities || []).length} icon={<UsersRound className="h-5 w-5"/>}/></DashboardStatGrid><DashboardSection title="Plano aplicável" description="A configuração continua editável na administração de planos."><div className="flex flex-wrap items-center gap-3 rounded-xl border p-4"><ReceiptText className="h-5 w-5 text-primary"/><strong>{plan?.name || 'Gestor de Eventos'}</strong><Badge variant="outline">{Number(plan?.commission_rate || 0)}% comissão</Badge></div></DashboardSection><DashboardSection title="Contas" description="Eventos, comunidades e subscrição associados a cada gestor."><form className="mb-4 flex gap-2"><label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input name="q" defaultValue={search} placeholder="Pesquisar gestor" className="pl-9"/></label><Button type="submit">Pesquisar</Button></form>{!managers?.length?<DashboardEmptyState icon={<CalendarCheck className="h-10 w-10"/>} title="Sem gestores" description="Ainda não existem contas deste tipo."/>:<div className="grid gap-3">{managers.map(manager=>{const subscription=(subscriptions||[]).find(item=>item.user_id===manager.id);return <article key={manager.id} className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{manager.full_name||'Gestor de eventos'}</p><Badge variant={manager.account_status==='active'?'outline':'destructive'}>{manager.account_status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{countFor(events as any,manager.id)} eventos · {countFor(communities as any,manager.id)} comunidades · plano {subscription?.tier||'free'}</p></div><Button asChild variant="outline"><Link href={`/admin/utilizadores?q=${encodeURIComponent(manager.full_name||manager.id)}`}>Gerir conta</Link></Button></article>})}</div>}</DashboardSection></DashboardPage>
}
