import Link from 'next/link'
import { Gavel, Search, ShieldAlert } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { dismissContentReportAction, removeReportedContentAction } from '@/app/admin/actions/moderation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PAGE_SIZE = 20
const reasonLabel: Record<string, string> = { spam: 'Spam', harassment: 'Assédio', hate: 'Discurso de ódio', nudity: 'Conteúdo sexual/nudez', violence: 'Violência', fraud: 'Fraude', other: 'Outro' }

function href(page: number, type: string, reason: string) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (type !== 'all') params.set('type', type)
  if (reason !== 'all') params.set('reason', reason)
  return `/admin/moderacao${params.toString() ? `?${params}` : ''}`
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1)
  const typeRaw = String(Array.isArray(params.type) ? params.type[0] : params.type || 'all')
  const reasonRaw = String(Array.isArray(params.reason) ? params.reason[0] : params.reason || 'all')
  const type = ['post', 'comment', 'community'].includes(typeRaw) ? typeRaw : 'all'
  const reason = Object.keys(reasonLabel).includes(reasonRaw) ? reasonRaw : 'all'
  const admin = createAdminClient()

  let query = admin.from('content_reports').select('id, reporter_user_id, target_type, target_id, reason, details, status, created_at', { count: 'exact' }).in('status', ['pending', 'reviewing']).order('created_at', { ascending: false })
  if (type !== 'all') query = query.eq('target_type', type)
  if (reason !== 'all') query = query.eq('reason', reason)
  const from = (page - 1) * PAGE_SIZE
  const { data: reportsData, count, error: reportsError } = await query.range(from, from + PAGE_SIZE - 1)
  const reports: any[] = reportsData || []
  const total = count || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const reporterIds = [...new Set(reports.map((report: any) => report.reporter_user_id))]
  const postIds = reports.filter((r: any) => r.target_type === 'post').map((r: any) => r.target_id)
  const commentIds = reports.filter((r: any) => r.target_type === 'comment').map((r: any) => r.target_id)
  const communityIds = reports.filter((r: any) => r.target_type === 'community').map((r: any) => r.target_id)
  const [reportersResult, postsResult, commentsResult, communitiesResult] = await Promise.all([
    reporterIds.length ? admin.from('platform_users').select('id, full_name').in('id', reporterIds) : Promise.resolve({ data: [] as any[] }),
    postIds.length ? admin.from('posts').select('id, content').in('id', postIds) : Promise.resolve({ data: [] as any[] }),
    commentIds.length ? admin.from('post_comments').select('id, content').in('id', commentIds) : Promise.resolve({ data: [] as any[] }),
    communityIds.length ? admin.from('communities').select('id, name, description').in('id', communityIds) : Promise.resolve({ data: [] as any[] }),
  ])
  const reporterMap = new Map((reportersResult.data || []).map((item: any) => [item.id, item.full_name]))
  const postMap = new Map((postsResult.data || []).map((item: any) => [item.id, item.content]))
  const commentMap = new Map((commentsResult.data || []).map((item: any) => [item.id, item.content]))
  const communityMap = new Map((communitiesResult.data || []).map((item: any) => [item.id, item.name || item.description]))
  const getPreview = (report: any) => report.target_type === 'post' ? postMap.get(report.target_id) || 'Publicação já removida' : report.target_type === 'comment' ? commentMap.get(report.target_id) || 'Comentário já removido' : report.target_type === 'community' ? communityMap.get(report.target_id) || 'Comunidade indisponível' : 'Conteúdo indisponível'

  return <div className="min-w-0 space-y-6">
    <section className="flex flex-col gap-2 border-b border-border pb-6"><div className="flex items-center gap-2 text-primary"><ShieldAlert className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Segurança e confiança</span></div><h1 className="text-3xl font-bold tracking-tight">Centro de Moderação</h1><p className="text-sm text-muted-foreground">Denúncias reais, com filtros e paginação no servidor.</p></section>
    {reportsError && <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-800">A tabela de denúncias ainda não está disponível neste ambiente. A migração de moderação precisa de ser aplicada antes de receber denúncias.</div>}
    <form method="get" className="grid min-w-0 gap-2 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"><select name="type" defaultValue={type} className="min-h-11 rounded-lg border border-input bg-background px-3"><option value="all">Todos os conteúdos</option><option value="post">Publicações</option><option value="comment">Comentários</option><option value="community">Comunidades</option></select><select name="reason" defaultValue={reason} className="min-h-11 rounded-lg border border-input bg-background px-3"><option value="all">Todos os motivos</option>{Object.entries(reasonLabel).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select><Button type="submit" className="min-h-11"><Search className="mr-2 h-4 w-4" />Filtrar</Button></form>
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b p-5"><div className="flex items-center gap-2"><Gavel className="h-5 w-5 text-destructive" /><h2 className="text-lg font-bold">Fila pendente</h2></div><span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">{total} pendente{total === 1 ? '' : 's'}</span></div>
      {reports.length === 0 ? <div className="p-12 text-center"><ShieldAlert className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" /><p className="font-semibold">Sem denúncias para estes filtros</p></div> : <div className="divide-y divide-border">{reports.map((report: any) => <article key={report.id} className="grid min-w-0 gap-4 p-5 lg:grid-cols-[180px_minmax(0,1fr)_220px] lg:items-center"><div><span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold uppercase text-muted-foreground">{report.target_type}</span><p className="mt-2 text-sm font-semibold">{reasonLabel[report.reason] || report.reason}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(report.created_at).toLocaleString('pt-PT')}</p></div><div className="min-w-0"><p className="line-clamp-2 break-words text-sm">{String(getPreview(report))}</p>{report.details && <p className="mt-2 break-words rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">“{report.details}”</p>}<p className="mt-2 text-xs text-muted-foreground">Denunciante: <span className="font-medium text-foreground">{reporterMap.get(report.reporter_user_id) || 'Utilizador'}</span></p></div><div className="grid grid-cols-2 gap-2 lg:flex lg:justify-end"><form action={dismissContentReportAction.bind(null, report.id)}><button type="submit" className="min-h-10 w-full rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-muted">Arquivar</button></form><form action={removeReportedContentAction.bind(null, report.id)}><button type="submit" className="min-h-10 w-full rounded-xl bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">Remover</button></form></div></article>)}</div>}
      {total > 0 && <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">{from + 1}–{Math.min(from + PAGE_SIZE, total)} de {total}</p><div className="flex items-center gap-2"><Button asChild variant="outline" size="sm" className={page <= 1 ? 'pointer-events-none opacity-50' : ''}><Link href={href(page - 1, type, reason)}>Anterior</Link></Button><span className="text-sm">{page} / {totalPages}</span><Button asChild variant="outline" size="sm" className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}><Link href={href(page + 1, type, reason)}>Seguinte</Link></Button></div></div>}
    </section>
  </div>
}
