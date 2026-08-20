import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building2, Dumbbell, Eye, Search, UserCog, UserRound, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import type { Tables } from '@/lib/supabase-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppImage } from '@/components/ui/app-image'
import { DashboardEmptyState, DashboardErrorState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { ServerPagination } from '@/components/patterns/server-pagination'

const PAGE_SIZE = 20
type UserRole = NonNullable<Tables<'platform_users'>['type']>
type RoleFilter = 'all' | UserRole
type AdminUserRow = Pick<Tables<'platform_users'>, 'id' | 'full_name' | 'type' | 'avatar_url' | 'created_at'> & { email: string | null }
const roleLabels: Record<UserRole, string> = { athlete: 'Atleta', professional: 'Profissional', venue_manager: 'Gestor de espaço' }
const roleOptions: Array<{ value: RoleFilter; label: string }> = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'athlete', label: 'Atletas' },
  { value: 'professional', label: 'Profissionais' },
  { value: 'venue_manager', label: 'Gestores de espaço' },
]
function parseRole(value: string | undefined): RoleFilter { return value === 'athlete' || value === 'professional' || value === 'venue_manager' ? value : 'all' }
function pageHref(page: number, q: string, role: RoleFilter) { const params = new URLSearchParams(); if (page > 1) params.set('page', String(page)); if (q) params.set('q', q); if (role !== 'all') params.set('role', role); const suffix = params.toString(); return `/admin/utilizadores${suffix ? `?${suffix}` : ''}` }

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/admin/login'); const access = await resolveSessionAccess(supabase, user); if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')
  const params = await searchParams; const rawPage = Array.isArray(params.page) ? params.page[0] : params.page; const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q; const rawRole = Array.isArray(params.role) ? params.role[0] : params.role
  const page = Math.max(1, Number.parseInt(rawPage || '1', 10) || 1); const q = String(rawQuery || '').trim().slice(0, 100); const role = parseRole(rawRole); const from = (page - 1) * PAGE_SIZE; const to = from + PAGE_SIZE - 1
  const admin = createAdminClient(); let query = admin.from('platform_users').select('id, full_name, type, avatar_url, created_at', { count: 'exact' }).order('created_at', { ascending: false })
  if (role !== 'all') query = query.eq('type', role); if (q) query = query.or(`full_name.ilike.%${q.replace(/[,%]/g, '')}%,id.eq.${/^[0-9a-f-]{36}$/i.test(q) ? q : '00000000-0000-0000-0000-000000000000'}`)
  const [listResult,totalResult,athleteResult,professionalResult,venueManagerResult] = await Promise.all([
    query.range(from, to),
    admin.from('platform_users').select('id', { count: 'exact', head: true }),
    admin.from('platform_users').select('id', { count: 'exact', head: true }).eq('type', 'athlete'),
    admin.from('platform_users').select('id', { count: 'exact', head: true }).eq('type', 'professional'),
    admin.from('platform_users').select('id', { count: 'exact', head: true }).eq('type', 'venue_manager'),
  ])
  const failures = [listResult.error,totalResult.error,athleteResult.error,professionalResult.error,venueManagerResult.error].filter(Boolean)
  if (failures.length) return <DashboardPage><DashboardPageHeader title="Utilizadores da plataforma" description="Atletas, profissionais e gestores de espaço."/><DashboardErrorState title="Não foi possível carregar os utilizadores" description={failures.map(error=>error?.message).filter(Boolean).join(' · ')}/></DashboardPage>

  const profiles = listResult.data || []
  const rows: AdminUserRow[] = await Promise.all(profiles.map(async profile => { const auth = await admin.auth.admin.getUserById(profile.id); if (auth.error) throw new Error(`Falha ao resolver identidade Auth de ${profile.id}: ${auth.error.message}`); return { ...profile, email: auth.data.user?.email || null } }))
  const total = listResult.count ?? 0; const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE)); if (page > totalPages && total > 0) redirect(pageHref(totalPages, q, role))

  return <DashboardPage>
    <DashboardPageHeader title="Utilizadores da plataforma" description="Contas de produto. Administradores são mantidos numa área própria e não são misturados com estes roles." action={<Button asChild variant="outline"><Link href="/admin/administradores"><UserCog className="mr-2 h-4 w-4"/>Administradores</Link></Button>} />
    <DashboardStatGrid><DashboardStat label="Total" value={totalResult.count ?? 0} icon={<Users className="h-5 w-5" />} /><DashboardStat label="Atletas" value={athleteResult.count ?? 0} icon={<UserRound className="h-5 w-5" />} /><DashboardStat label="Profissionais" value={professionalResult.count ?? 0} icon={<Dumbbell className="h-5 w-5" />} /><DashboardStat label="Gestores" value={venueManagerResult.count ?? 0} icon={<Building2 className="h-5 w-5" />} /></DashboardStatGrid>
    <DashboardSection title="Contas da plataforma" description="Pesquisa por nome ou UUID, filtra por tipo e abre a ficha administrativa completa.">
      <form method="get" className="mb-4 grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_220px_auto]"><label className="relative min-w-0"><span className="sr-only">Pesquisar utilizadores</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="Nome ou UUID" className="min-h-11 w-full pl-10" /></label><select name="role" defaultValue={role} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">{roleOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><Button type="submit" className="min-h-11">Filtrar</Button></form>
      {rows.length === 0 ? <DashboardEmptyState icon={<Users className="h-10 w-10" />} title="Sem utilizadores" description="Não existem contas para os critérios selecionados." /> : <div className="grid min-w-0 gap-3">{rows.map(row => <article key={row.id} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">{row.avatar_url ? <AppImage src={row.avatar_url} alt="" fill sizes="44px" className="object-cover"/> : (row.full_name || row.email || 'U').charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{row.full_name || 'Sem nome'}</p><p className="truncate text-xs text-muted-foreground">{row.email || row.id}</p><p className="mt-1 text-xs text-muted-foreground">Registo: {new Date(row.created_at).toLocaleDateString('pt-PT')}</p></div></div><div className="flex min-w-0 flex-wrap items-center gap-2 self-start lg:justify-end lg:self-center"><Badge variant="outline">{row.type ? roleLabels[row.type] : 'Sem tipo'}</Badge><Button asChild variant="outline" size="sm" className="min-h-11"><Link href={`/admin/utilizadores/${row.id}`}><Eye className="mr-2 h-4 w-4"/>Ver ficha</Link></Button>{row.type === 'professional' && <Button asChild variant="outline" size="sm" className="min-h-11"><Link href={`/admin/profissionais?q=${encodeURIComponent(row.full_name || row.id)}`}>Profissional</Link></Button>}{row.type === 'venue_manager' && <Button asChild variant="outline" size="sm" className="min-h-11"><Link href={`/admin/espacos?filter=managed&q=${encodeURIComponent(row.full_name || row.id)}`}>Espaços</Link></Button>}</div></article>)}</div>}
      <ServerPagination currentPage={page} totalPages={totalPages} totalItems={total} startItem={total > 0 ? from + 1 : 0} endItem={Math.min(to + 1, total)} previousHref={pageHref(Math.max(1,page - 1), q, role)} nextHref={pageHref(Math.min(totalPages,page + 1), q, role)} />
    </DashboardSection>
  </DashboardPage>
}
