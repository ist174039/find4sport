import { Gavel, ShieldAlert } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { dismissContentReportAction, removeReportedContentAction } from '@/app/admin/actions/moderation'

const reasonLabel: Record<string, string> = {
  spam: 'Spam',
  harassment: 'Assédio',
  hate: 'Discurso de ódio',
  nudity: 'Conteúdo sexual/nudez',
  violence: 'Violência',
  fraud: 'Fraude',
  other: 'Outro',
}

export default async function Page() {
  const admin = createAdminClient()
  const { data: reports = [] } = await admin
    .from('content_reports')
    .select('id, reporter_user_id, target_type, target_id, reason, details, status, created_at')
    .in('status', ['pending', 'reviewing'])
    .order('created_at', { ascending: false })

  const reporterIds = [...new Set(reports.map((report: any) => report.reporter_user_id))]
  const postIds = reports.filter((r: any) => r.target_type === 'post').map((r: any) => r.target_id)
  const commentIds = reports.filter((r: any) => r.target_type === 'comment').map((r: any) => r.target_id)
  const communityIds = reports.filter((r: any) => r.target_type === 'community').map((r: any) => r.target_id)

  const [{ data: reporters = [] }, { data: posts = [] }, { data: comments = [] }, { data: communities = [] }] = await Promise.all([
    reporterIds.length ? admin.from('platform_users').select('id, full_name').in('id', reporterIds) : Promise.resolve({ data: [] as any[] }),
    postIds.length ? admin.from('posts').select('id, content').in('id', postIds) : Promise.resolve({ data: [] as any[] }),
    commentIds.length ? admin.from('post_comments').select('id, content').in('id', commentIds) : Promise.resolve({ data: [] as any[] }),
    communityIds.length ? admin.from('communities').select('id, name, description').in('id', communityIds) : Promise.resolve({ data: [] as any[] }),
  ])

  const reporterMap = new Map(reporters.map((item: any) => [item.id, item.full_name]))
  const postMap = new Map(posts.map((item: any) => [item.id, item.content]))
  const commentMap = new Map(comments.map((item: any) => [item.id, item.content]))
  const communityMap = new Map(communities.map((item: any) => [item.id, item.name || item.description]))

  const getPreview = (report: any) => {
    if (report.target_type === 'post') return postMap.get(report.target_id) || 'Publicação já removida'
    if (report.target_type === 'comment') return commentMap.get(report.target_id) || 'Comentário já removido'
    if (report.target_type === 'community') return communityMap.get(report.target_id) || 'Comunidade indisponível'
    return 'Conteúdo indisponível'
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-primary"><ShieldAlert className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Segurança e confiança</span></div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Centro de Moderação</h1>
        <p className="text-sm text-muted-foreground">Denúncias reais submetidas pelos utilizadores. Nenhum rating negativo é tratado automaticamente como abuso.</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-2"><Gavel className="h-5 w-5 text-destructive" /><h2 className="text-lg font-bold">Fila pendente</h2></div>
          <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">{reports.length} pendente{reports.length === 1 ? '' : 's'}</span>
        </div>

        {reports.length === 0 ? (
          <div className="p-12 text-center"><ShieldAlert className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" /><p className="font-semibold">Sem denúncias pendentes</p><p className="mt-1 text-sm text-muted-foreground">A fila está limpa.</p></div>
        ) : (
          <div className="divide-y divide-border">
            {reports.map((report: any) => (
              <article key={report.id} className="grid gap-4 p-5 lg:grid-cols-[180px_1fr_220px] lg:items-center">
                <div>
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold uppercase text-muted-foreground">{report.target_type}</span>
                  <p className="mt-2 text-sm font-semibold">{reasonLabel[report.reason] || report.reason}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(report.created_at).toLocaleString('pt-PT')}</p>
                </div>

                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm text-foreground">{String(getPreview(report))}</p>
                  {report.details && <p className="mt-2 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">“{report.details}”</p>}
                  <p className="mt-2 text-xs text-muted-foreground">Denunciante: <span className="font-medium text-foreground">{reporterMap.get(report.reporter_user_id) || 'Utilizador'}</span></p>
                </div>

                <div className="flex gap-2 lg:justify-end">
                  <form action={dismissContentReportAction.bind(null, report.id)}><button type="submit" className="rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">Arquivar</button></form>
                  <form action={removeReportedContentAction.bind(null, report.id)}><button type="submit" className="rounded-xl bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90">Remover conteúdo</button></form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
