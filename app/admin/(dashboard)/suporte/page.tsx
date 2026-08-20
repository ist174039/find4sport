import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Clock3, Headphones, Search, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardEmptyState, DashboardErrorState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { ServerPagination } from '@/components/patterns/server-pagination'

const PAGE_SIZE = 20
const STATUSES = ['all','open','pending_admin','pending_user','resolved','closed'] as const
const PRIORITIES = ['all','low','normal','high','urgent'] as const
function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value }
function safe<T extends readonly string[]>(value: string | undefined, values: T, fallback: T[number]) { return values.includes(value as T[number]) ? value as T[number] : fallback }
function href(page:number,status:string,priority:string,q:string){const p=new URLSearchParams();if(page>1)p.set('page',String(page));if(status!=='all')p.set('status',status);if(priority!=='all')p.set('priority',priority);if(q)p.set('q',q);return `/admin/suporte${p.toString()?`?${p}`:''}`}

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect('/admin/login')
  const access=await resolveSessionAccess(supabase,user); if(!access?.canAccessAdmin)redirect('/admin/login?error=unauthorized')
  const params=await searchParams; const page=Math.max(1,Number(first(params.page)||'1')||1); const status=safe(first(params.status),STATUSES,'all'); const priority=safe(first(params.priority),PRIORITIES,'all'); const q=String(first(params.q)||'').trim().replace(/[,%()]/g,' ').replace(/\s+/g,' ').slice(0,100)
  const db=createAdminClient() as any; let query=db.from('support_tickets').select('id,user_id,subject,category,priority,status,assigned_admin_id,created_at,updated_at',{count:'exact'}).order('updated_at',{ascending:false})
  if(status!=='all')query=query.eq('status',status); if(priority!=='all')query=query.eq('priority',priority); if(q)query=query.ilike('subject',`%${q}%`)
  const from=(page-1)*PAGE_SIZE; const [list,open,pendingAdmin,urgent,resolved]=await Promise.all([
    query.range(from,from+PAGE_SIZE-1),
    db.from('support_tickets').select('id',{count:'exact',head:true}).in('status',['open','pending_admin','pending_user']),
    db.from('support_tickets').select('id',{count:'exact',head:true}).eq('status','pending_admin'),
    db.from('support_tickets').select('id',{count:'exact',head:true}).eq('priority','urgent').neq('status','closed'),
    db.from('support_tickets').select('id',{count:'exact',head:true}).eq('status','resolved'),
  ])
  if(list.error){return <DashboardPage><DashboardPageHeader title="Suporte" description="Fila central de casos de suporte."/><DashboardErrorState title="O sistema de suporte ainda não está disponível" description={`A migration de support_tickets/support_messages ainda não está aplicada ou a consulta falhou: ${list.error.message}`} /></DashboardPage>}
  const rows=list.data||[]; const userIds=[...new Set(rows.map((r:any)=>r.user_id).filter(Boolean))]; const adminIds=[...new Set(rows.map((r:any)=>r.assigned_admin_id).filter(Boolean))]
  const [usersResult,adminsResult]=await Promise.all([userIds.length?db.from('platform_users').select('id,full_name,type').in('id',userIds):Promise.resolve({data:[]}),adminIds.length?db.from('admins').select('id,email,admin_type').in('id',adminIds):Promise.resolve({data:[]})])
  const users=new Map((usersResult.data||[]).map((r:any)=>[r.id,r])); const admins=new Map((adminsResult.data||[]).map((r:any)=>[r.id,r])); const total=list.count??0; const totalPages=Math.max(1,Math.ceil(total/PAGE_SIZE)); if(page>totalPages&&total>0)redirect(href(totalPages,status,priority,q))
  return <DashboardPage>
    <DashboardPageHeader title="Suporte" description="Fila de trabalho para pedidos iniciados por utilizadores ou administradores, independente das conversas comerciais." />
    <DashboardStatGrid><DashboardStat label="Casos ativos" value={open.count??0} icon={<Headphones className="h-5 w-5"/>}/><DashboardStat label="Aguardam Admin" value={pendingAdmin.count??0} icon={<Clock3 className="h-5 w-5"/>}/><DashboardStat label="Urgentes" value={urgent.count??0} icon={<AlertTriangle className="h-5 w-5"/>}/><DashboardStat label="Resolvidos" value={resolved.count??0} icon={<CheckCircle2 className="h-5 w-5"/>}/></DashboardStatGrid>
    <DashboardSection title="Fila de suporte" description="Filtra por estado/prioridade e abre cada caso para responder, atribuir e resolver.">
      <form method="get" className="mb-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]"><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input name="q" defaultValue={q} placeholder="Assunto" className="pl-9"/></label><select name="status" defaultValue={status} className="min-h-11 rounded-lg border border-input bg-background px-3"><option value="all">Todos os estados</option>{STATUSES.filter(v=>v!=='all').map(v=><option key={v} value={v}>{v}</option>)}</select><select name="priority" defaultValue={priority} className="min-h-11 rounded-lg border border-input bg-background px-3"><option value="all">Todas prioridades</option>{PRIORITIES.filter(v=>v!=='all').map(v=><option key={v} value={v}>{v}</option>)}</select><Button type="submit">Filtrar</Button></form>
      {rows.length===0?<DashboardEmptyState icon={<Headphones className="h-10 w-10"/>} title="Fila vazia" description="Não existem casos para estes critérios."/>:<div className="space-y-3">{rows.map((ticket:any)=>{const target=users.get(ticket.user_id) as any; const assigned=admins.get(ticket.assigned_admin_id) as any;return <Link key={ticket.id} href={`/admin/suporte/${ticket.id}`} className="block rounded-2xl border p-4 transition hover:border-primary/40 hover:bg-muted/20"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge variant="outline">{ticket.category}</Badge><Badge variant={ticket.priority==='urgent'?'destructive':'secondary'}>{ticket.priority}</Badge><Badge>{ticket.status}</Badge></div><p className="mt-2 truncate font-semibold">{ticket.subject}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><UserRound className="h-3.5 w-3.5"/>{target?.full_name||ticket.user_id||'Utilizador indisponível'}{target?.type?` · ${target.type}`:''}</p></div><div className="shrink-0 text-xs text-muted-foreground sm:text-right"><p>{new Date(ticket.updated_at).toLocaleString('pt-PT')}</p><p className="mt-1">{assigned?`Atribuído: ${assigned.email}`:'Não atribuído'}</p></div></div></Link>})}</div>}
      {total>0&&<ServerPagination currentPage={page} totalPages={totalPages} totalItems={total} startItem={from+1} endItem={Math.min(from+PAGE_SIZE,total)} previousHref={href(Math.max(1,page-1),status,priority,q)} nextHref={href(Math.min(totalPages,page+1),status,priority,q)} label="casos"/>}
    </DashboardSection>
  </DashboardPage>
}
