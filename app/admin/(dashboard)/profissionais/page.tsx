import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, ChevronLeft, ChevronRight, Dumbbell, Eye, Search, ShieldAlert, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { CreateProfessionalButton, ProfessionalStateActions } from './professional-admin-actions'

const PAGE_SIZE = 20
const FILTERS = ['all', 'active', 'pending', 'suspended'] as const
type Filter = typeof FILTERS[number]

function cleanQuery(value: string) {
  return value.trim().replace(/[,%()]/g, ' ').replace(/\s+/g, ' ').slice(0, 100)
}

function pageHref(page: number, q: string, filter: Filter) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (q) params.set('q', q)
  if (filter !== 'all') params.set('status', filter)
  const suffix = params.toString()
  return `/admin/profissionais${suffix ? `?${suffix}` : ''}`
}

export default async function AdminProfessionalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const params = await searchParams
  const q = cleanQuery(String(Array.isArray(params.q) ? params.q[0] : params.q || ''))
  const rawFilter = String(Array.isArray(params.status) ? params.status[0] : params.status || 'all')
  const filter: Filter = FILTERS.includes(rawFilter as Filter) ? rawFilter as Filter : 'all'
  const page = Math.max(1, Number.parseInt(String(Array.isArray(params.page) ? params.page[0] : params.page || '1'), 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const admin = createAdminClient()

  let listQuery = admin
    .from('professionals')
    .select('id,user_id,full_name,professional_name,email,address,avatar_url,public_slug,status,is_verified,rating_avg,review_count,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (q) listQuery = listQuery.or(`full_name.ilike.%${q}%,professional_name.ilike.%${q}%,email.ilike.%${q}%,address.ilike.%${q}%`)
  if (filter === 'active') listQuery = listQuery.eq('status', 'active').eq('is_verified', true)
  else if (filter === 'pending') listQuery = listQuery.eq('status', 'pending')
  else if (filter === 'suspended') listQuery = listQuery.eq('status', 'suspended')

  const [listResult, totalResult, activeResult, pendingResult, criticalReviewResult] = await Promise.all([
    listQuery.range(from, from + PAGE_SIZE - 1),
    admin.from('professionals').select('id', { count: 'exact', head: true }),
    admin.from('professionals').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('is_verified', true),
    admin.from('professionals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('reviews').select('id', { count: 'exact', head: true }).not('professional_id', 'is', null).lte('rating', 2),
  ])

  if (listResult.error) throw new Error(`Não foi possível carregar profissionais: ${listResult.error.message}`)
  const rows = listResult.data || []
  const total = listResult.count || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages && total > 0) redirect(pageHref(totalPages, q, filter))

  return <DashboardPage>
    <DashboardPageHeader title="Profissionais" description="Onboarding, aprovação e estado dos perfis profissionais. Filtros e paginação são executados no servidor." action={<CreateProfessionalButton />} />
    <DashboardStatGrid>
      <DashboardStat label="Total" value={totalResult.count || 0} icon={<Dumbbell className="h-5 w-5" />} />
      <DashboardStat label="Ativos" value={activeResult.count || 0} icon={<CheckCircle2 className="h-5 w-5" />} />
      <DashboardStat label="Pendentes" value={pendingResult.count || 0} icon={<ShieldAlert className="h-5 w-5" />} />
      <DashboardStat label="Avaliações críticas" value={criticalReviewResult.count || 0} hint="Avaliações com 2 estrelas ou menos; não são denúncias." icon={<Star className="h-5 w-5" />} />
    </DashboardStatGrid>

    <DashboardSection title="Perfis" description="Pesquisa por nome, email ou localização e filtra pelo estado real do perfil.">
      <form method="get" className="mb-4 grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_200px_auto]">
        <label className="relative min-w-0"><span className="sr-only">Pesquisar profissionais</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="Nome, email ou localização" className="min-h-11 w-full pl-10" /></label>
        <select name="status" defaultValue={filter} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"><option value="all">Todos</option><option value="active">Ativos</option><option value="pending">Pendentes</option><option value="suspended">Suspensos</option></select>
        <Button type="submit" className="min-h-11">Filtrar</Button>
      </form>

      {rows.length === 0 ? <DashboardEmptyState icon={<Dumbbell className="h-10 w-10" />} title="Sem profissionais" description="Não existem perfis para os critérios selecionados." /> : <div className="grid min-w-0 gap-3">
        {rows.map(professional => {
          const name = professional.full_name || professional.professional_name || 'Profissional'
          return <article key={professional.id} className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">{professional.avatar_url ? <img src={professional.avatar_url} alt="" className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate font-semibold">{name}</p><p className="truncate text-sm text-muted-foreground">{professional.email || 'Sem email profissional'}{professional.address ? ` · ${professional.address}` : ''}</p><div className="mt-1 flex flex-wrap gap-2"><Badge variant="outline">{professional.status || 'sem estado'}</Badge>{professional.is_verified && <Badge>Verificado</Badge>}{Number(professional.review_count || 0) > 0 && <Badge variant="secondary">{Number(professional.rating_avg || 0).toFixed(1)} · {professional.review_count} avaliações</Badge>}</div></div></div>
            <div className="grid grid-cols-2 gap-2 sm:flex"><Button asChild className="min-h-10"><Link href={`/admin/profissionais/${professional.id}`}>Detalhes</Link></Button><Button asChild variant="outline" className="min-h-10"><Link href={`/profissionais/${professional.public_slug || professional.id}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Público</Link></Button><ProfessionalStateActions id={professional.id} name={name} isVerified={Boolean(professional.is_verified)} status={professional.status} /></div>
          </article>
        })}
      </div>}

      {total > 0 && <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">A mostrar {from + 1}–{Math.min(from + PAGE_SIZE, total)} de {total}</p><div className="flex items-center gap-2"><Button asChild variant="outline" size="sm" className={page <= 1 ? 'pointer-events-none opacity-50' : ''}><Link href={pageHref(page - 1, q, filter)}><ChevronLeft className="mr-1 h-4 w-4" />Anterior</Link></Button><span className="px-2 text-sm font-medium">{page} / {totalPages}</span><Button asChild variant="outline" size="sm" className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}><Link href={pageHref(page + 1, q, filter)}>Seguinte<ChevronRight className="ml-1 h-4 w-4" /></Link></Button></div></div>}
    </DashboardSection>
  </DashboardPage>
}
