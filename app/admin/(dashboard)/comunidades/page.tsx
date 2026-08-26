import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, ChevronRight, Eye, LockKeyhole, Search, UserRoundCheck, UsersRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

const PAGE_SIZE = 20
const FILTERS = ['all', 'public', 'private'] as const
type Filter = typeof FILTERS[number]

function cleanQuery(value: string) {
  return value.trim().replace(/[,%()]/g, ' ').replace(/\s+/g, ' ').slice(0, 100)
}

function pageHref(page: number, q: string, filter: Filter) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (q) params.set('q', q)
  if (filter !== 'all') params.set('visibility', filter)
  const suffix = params.toString()
  return `/admin/comunidades${suffix ? `?${suffix}` : ''}`
}

export default async function AdminCommunitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const params = await searchParams
  const q = cleanQuery(String(Array.isArray(params.q) ? params.q[0] : params.q || ''))
  const rawFilter = String(Array.isArray(params.visibility) ? params.visibility[0] : params.visibility || 'all')
  const filter: Filter = FILTERS.includes(rawFilter as Filter) ? rawFilter as Filter : 'all'
  const page = Math.max(1, Number.parseInt(String(Array.isArray(params.page) ? params.page[0] : params.page || '1'), 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const admin = createAdminClient()

  let listQuery = admin
    .from('communities')
    .select('id,name,slug,description,address,is_private,posting_policy,created_at,created_by,platform_users!communities_created_by_fkey(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
  if (q) listQuery = listQuery.or(`name.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%`)
  if (filter === 'public') listQuery = listQuery.eq('is_private', false)
  if (filter === 'private') listQuery = listQuery.eq('is_private', true)

  const [listResult, publicResult, privateResult, pendingResult] = await Promise.all([
    listQuery.range(from, from + PAGE_SIZE - 1),
    admin.from('communities').select('id', { count: 'exact', head: true }).eq('is_private', false),
    admin.from('communities').select('id', { count: 'exact', head: true }).eq('is_private', true),
    admin.from('community_join_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])
  if (listResult.error) throw new Error(`Não foi possível carregar comunidades: ${listResult.error.message}`)
  const rows = listResult.data || []
  const ids = rows.map(row => row.id)
  const [memberResult, requestResult] = ids.length ? await Promise.all([
    admin.from('community_members').select('community_id').in('community_id', ids),
    admin.from('community_join_requests').select('community_id,status').in('community_id', ids).eq('status', 'pending'),
  ]) : [{ data: [] }, { data: [] }]
  const memberCounts = new Map<string, number>()
  const requestCounts = new Map<string, number>()
  for (const item of memberResult.data || []) if (item.community_id) memberCounts.set(item.community_id, (memberCounts.get(item.community_id) || 0) + 1)
  for (const item of requestResult.data || []) requestCounts.set(item.community_id, (requestCounts.get(item.community_id) || 0) + 1)

  const total = listResult.count || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages && total > 0) redirect(pageHref(totalPages, q, filter))

  return <DashboardPage>
    <DashboardPageHeader title="Comunidades" description="Supervisão explícita das comunidades, proprietários, membros e pedidos de adesão." action={<Button asChild><Link href="/comunidades" target="_blank">Ver diretório público</Link></Button>} />
    <DashboardStatGrid>
      <DashboardStat label="Resultados" value={total} href={pageHref(1, q, 'all')} icon={<UsersRound className="h-5 w-5" />} />
      <DashboardStat label="Públicas" value={publicResult.count || 0} href={pageHref(1, '', 'public')} icon={<Eye className="h-5 w-5" />} />
      <DashboardStat label="Privadas" value={privateResult.count || 0} href={pageHref(1, '', 'private')} icon={<LockKeyhole className="h-5 w-5" />} />
      <DashboardStat label="Pedidos pendentes" value={pendingResult.count || 0} href="/admin/comunidades#lista-comunidades" hint="Identificados por comunidade" icon={<UserRoundCheck className="h-5 w-5" />} />
    </DashboardStatGrid>

    <div id="lista-comunidades" className="scroll-mt-24"><DashboardSection title="Lista de comunidades" description="Pesquisa e filtros são aplicados no servidor; dados privados ficam restritos à consola administrativa.">
      <form method="get" className="mb-4 grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_200px_auto]">
        <label className="relative min-w-0"><span className="sr-only">Pesquisar comunidades</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="Nome, descrição ou localização" className="min-h-11 w-full pl-10" /></label>
        <select name="visibility" defaultValue={filter} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="all">Todas</option><option value="public">Públicas</option><option value="private">Privadas</option></select>
        <Button type="submit" className="min-h-11">Filtrar</Button>
      </form>

      {rows.length === 0 ? <DashboardEmptyState icon={<UsersRound className="h-10 w-10" />} title="Sem comunidades" description="Não existem comunidades para os critérios selecionados." /> : <div className="grid min-w-0 gap-3">
        {rows.map(community => {
          const owner = Array.isArray(community.platform_users) ? community.platform_users[0] : community.platform_users
          return <article key={community.id} className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words font-semibold">{community.name}</h3><Badge variant={community.is_private ? 'secondary' : 'outline'}>{community.is_private ? 'Privada' : 'Pública'}</Badge><Badge variant="outline">{community.posting_policy === 'admin_only' ? 'Publicação por admins' : community.posting_policy === 'reactions_only' ? 'Membros apenas reagem' : 'Publicação por membros'}</Badge></div><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{community.description || 'Sem descrição'}{community.address ? ` · ${community.address}` : ''}</p><p className="mt-2 text-xs text-muted-foreground">Responsável: {owner?.full_name || 'Conta não identificada'} · {memberCounts.get(community.id) || 0} membros · {requestCounts.get(community.id) || 0} pedidos pendentes</p></div>
            <div className="grid grid-cols-2 gap-2 sm:flex"><Button asChild className="min-h-11"><Link href={`/admin/comunidades/${community.id}`}>Administrar</Link></Button><Button asChild variant="outline" className="min-h-11"><Link href={`/comunidades/${community.slug || community.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Ver</Link></Button></div>
          </article>
        })}
      </div>}

      {total > 0 && <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">A mostrar {from + 1}–{Math.min(from + PAGE_SIZE, total)} de {total}</p><div className="flex items-center gap-2"><Button asChild variant="outline" size="sm" className={page <= 1 ? 'pointer-events-none opacity-50' : ''}><Link href={pageHref(page - 1, q, filter)}><ChevronLeft className="mr-1 h-4 w-4" />Anterior</Link></Button><span className="px-2 text-sm font-medium">{page} / {totalPages}</span><Button asChild variant="outline" size="sm" className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}><Link href={pageHref(page + 1, q, filter)}>Seguinte<ChevronRight className="ml-1 h-4 w-4" /></Link></Button></div></div>}
    </DashboardSection></div>
  </DashboardPage>
}
