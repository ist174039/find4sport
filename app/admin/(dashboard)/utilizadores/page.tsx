import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building2, Dumbbell, UserRound, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

const roleLabels: Record<string, string> = {
  athlete: 'Atleta',
  professional: 'Profissional',
  venue_manager: 'Gestor de espaço',
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const admin = createAdminClient()
  const { data: users, error } = await admin
    .from('platform_users')
    .select('id, email, full_name, type, avatar_url, created_at')
    .order('created_at', { ascending: false })
    .limit(250)

  if (error) throw error
  const rows = users || []
  const athleteCount = rows.filter(row => row.type === 'athlete').length
  const professionalCount = rows.filter(row => row.type === 'professional').length
  const venueManagerCount = rows.filter(row => row.type === 'venue_manager').length

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Utilizadores"
        description="Contas reais da plataforma. Roles de produto e permissões administrativas são tratados como conceitos separados."
      />

      <DashboardStatGrid>
        <DashboardStat label="Total" value={rows.length} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Atletas" value={athleteCount} icon={<UserRound className="h-5 w-5" />} />
        <DashboardStat label="Profissionais" value={professionalCount} icon={<Dumbbell className="h-5 w-5" />} />
        <DashboardStat label="Gestores" value={venueManagerCount} icon={<Building2 className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection
        title="Contas da plataforma"
        description="Esta página não cria utilizadores artificialmente nem altera roles sem um fluxo de onboarding válido."
      >
        {rows.length === 0 ? (
          <DashboardEmptyState icon={<Users className="h-10 w-10" />} title="Sem utilizadores" description="Ainda não existem contas registadas." />
        ) : (
          <div className="grid gap-3">
            {rows.map(row => (
              <article key={row.id} className="flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">
                    {row.avatar_url ? <img src={row.avatar_url} alt="" className="h-full w-full object-cover" /> : (row.full_name || row.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{row.full_name || 'Sem nome'}</p>
                    <p className="truncate text-xs text-muted-foreground">{row.email || row.id}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Registo: {row.created_at ? new Date(row.created_at).toLocaleDateString('pt-PT') : '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge variant="outline">{roleLabels[row.type] || row.type}</Badge>
                  {row.type === 'professional' && <Button asChild variant="outline" size="sm" className="min-h-10"><Link href="/admin/profissionais">Ver profissionais</Link></Button>}
                  {row.type === 'venue_manager' && <Button asChild variant="outline" size="sm" className="min-h-10"><Link href="/admin/espacos">Ver espaços</Link></Button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </DashboardSection>
    </DashboardPage>
  )
}
