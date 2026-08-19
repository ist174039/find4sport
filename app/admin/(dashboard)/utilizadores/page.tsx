import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building2, ChevronLeft, ChevronRight, Dumbbell, Search, UserRound, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import type { Tables } from '@/lib/supabase-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

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

function parseRole(value: string | undefined): RoleFilter {
  return value === 'athlete' || value === 'professional' || value === 'venue_manager' ? value : 'all'
}

function pageHref(page: number, q: string, role: RoleFilter) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (q) params.set('q', q)
  if (role !== 'all') params.set('role', role)
  const suffix = params.toString()
  return `/admin/utilizadores${suffix ? `?${suffix}` : ''}`
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const params = await searchParams
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q
  const rawRole = Array.isArray(params.role) ? params.role[0] : params.role
  const page = Math.max(1, Number.parseInt(rawPage || '1', 10) || 1)
  const q = String(rawQuery || '').trim().slice(0, 100)
  const role = parseRole(rawRole)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const admin = createAdminClient()
  let query = admin
    .from('platform_users')
    .select('id, full_name, type, avatar_url, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (role !== 'all') query = query.eq('type', role)
  if (q) query = query.or(`full_name.ilike.%${q.replace(/[,%]/g, '')}%,id.eq.${/^[0-9a-f-]{36}$/i.test(q) ? q : '00000000-0000-0000-0000-000000000000'}`)

  const { data: profiles, count, error } = await query.range(from, to)
  if (error) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="Utilizadores" description="Gestão das contas da plataforma." />
        <DashboardSection title="Não foi possível carregar os utilizadores">
          <p className="text-sm text-destructive">{error.message}</p>
          <p className="mt-2 text-sm text-muted-foreground">A página deixou de depender da coluna email em platform_users; se este erro persistir, indica uma divergência adicional de schema que deve ser corrigida na base de dados.</p>
        </DashboardSection>
      </DashboardPage>
    )
  }

  const rows: AdminUserRow[] = await Promise.all((profiles || []).map(async profile => {
    const { data } = await admin.auth.admin.getUserById(profile.id)
    return { ...profile, email: data?.user?.email || null }
  }))

  const [{ count: totalAll }, { count: athleteCount }, { count: professionalCount }, { count: venueManagerCount }] = await Promise.all([
    admin.from('platform_users').select('id', { count: 'exact', head: true }),
    admin.from('platform_users').select('id', { count: 'exact', head: true }).eq('type', 'athlete'),
    admin.from('platform_users').select('id', { count: 'exact', head: true }).eq('type', 'professional'),
    admin.from('platform_users').select('id', { count: 'exact', head: true }).eq('type', 'venue_manager'),
  ])

  const total = count || 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages && total > 0) redirect(pageHref(totalPages, q, role))

  return (
    <DashboardPage>
      <DashboardPageHeader title="Utilizadores" description="Perfis de produto paginados no servidor. O email é resolvido no Auth e não é assumido como coluna de platform_users." />

      <DashboardStatGrid>
        <DashboardStat label="Total" value={totalAll || 0} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Atletas" value={athleteCount || 0} icon={<UserRound className="h-5 w-5" />} />
        <DashboardStat label="Profissionais" value={professionalCount || 0} icon={<Dumbbell className="h-5 w-5" />} />
        <DashboardStat label="Gestores" value={venueManagerCount || 0} icon={<Building2 className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection title="Contas da plataforma" description="Pesquisa por nome ou UUID e filtro por tipo de utilizador.">
        <form method="get" className="mb-4 grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_220px_auto]">
          <label className="relative min-w-0"><span className="sr-only">Pesquisar utilizadores</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="Nome ou UUID" className="min-h-11 w-full pl-10" /></label>
          <select name="role" defaultValue={role} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">{roleOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <Button type="submit" className="min-h-11">Filtrar</Button>
        </form>

        {rows.length === 0 ? (
          <DashboardEmptyState icon={<Users className="h-10 w-10" />} title="Sem utilizadores" description="Não existem contas para os critérios selecionados." />
        ) : (
          <div className="grid min-w-0 gap-3">
            {rows.map(row => (
              <article key={row.id} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">{row.avatar_url ? <img src={row.avatar_url} alt="" className="h-full w-full object-cover" /> : (row.full_name || row.email || 'U').charAt(0).toUpperCase()}</div>
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{row.full_name || 'Sem nome'}</p><p className="truncate text-xs text-muted-foreground">{row.email || row.id}</p><p className="mt-1 text-xs text-muted-foreground">Registo: {row.created_at ? new Date(row.created_at).toLocaleDateString('pt-PT') : '—'}</p></div>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2 self-start sm:justify-end sm:self-center"><Badge variant="outline">{row.type ? roleLabels[row.type] : 'Sem tipo'}</Badge>{row.type === 'professional' && <Button asChild variant="outline" size="sm" className="min-h-10"><Link href={`/admin/profissionais?q=${encodeURIComponent(row.full_name || row.id)}`}>Ver profissional</Link></Button>}{row.type === 'venue_manager' && <Button asChild variant="outline" size="sm" className="min-h-10"><Link href={`/admin/espacos?q=${encodeURIComponent(row.full_name || row.id)}`}>Ver espaços</Link></Button>}</div>
              </article>
            ))}
          </div>
        )}

        {total > 0 && <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">A mostrar {from + 1}–{Math.min(to + 1, total)} de {total} resultados</p><div className="flex items-center gap-2"><Button asChild variant="outline" size="sm" className={page <= 1 ? 'pointer-events-none opacity-50' : ''}><Link href={pageHref(page - 1, q, role)}><ChevronLeft className="mr-1 h-4 w-4" />Anterior</Link></Button><span className="px-2 text-sm font-medium">{page} / {totalPages}</span><Button asChild variant="outline" size="sm" className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}><Link href={pageHref(page + 1, q, role)}>Seguinte<ChevronRight className="ml-1 h-4 w-4" /></Link></Button></div></div>}
      </DashboardSection>
    </DashboardPage>
  )
}
