import { redirect } from 'next/navigation'
import { Building2, Calendar, Star, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { DashboardErrorState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

function queryFailure(label: string, result: { error?: { message?: string } | null }) {
  return result.error ? `${label}: ${result.error.message || 'erro desconhecido'}` : null
}

export default async function AdminReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const admin = createAdminClient()
  const [users, professionals, spaces, events, reviews, reservations, completedReservations] = await Promise.all([
    admin.from('platform_users').select('id', { count: 'exact', head: true }),
    admin.from('professionals').select('id', { count: 'exact', head: true }),
    admin.from('sport_spaces').select('id', { count: 'exact', head: true }),
    admin.from('events').select('id', { count: 'exact', head: true }),
    admin.from('reviews').select('id', { count: 'exact', head: true }),
    admin.from('reservations').select('id', { count: 'exact', head: true }),
    admin.from('reservations').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
  ])

  const failures = [
    queryFailure('utilizadores', users),
    queryFailure('profissionais', professionals),
    queryFailure('espaços', spaces),
    queryFailure('eventos', events),
    queryFailure('avaliações', reviews),
    queryFailure('reservas', reservations),
    queryFailure('reservas concluídas', completedReservations),
  ].filter(Boolean) as string[]

  if (failures.length > 0) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="Relatórios" description="Indicadores factuais calculados a partir da base de dados." />
        <DashboardErrorState
          title="Não é seguro apresentar estes indicadores"
          description={`Uma ou mais consultas falharam; os valores não foram convertidos em zero. ${failures.join(' · ')}`}
        />
      </DashboardPage>
    )
  }

  const totalReservations = reservations.count ?? 0
  const completed = completedReservations.count ?? 0
  const completionRate = totalReservations > 0 ? (completed / totalReservations) * 100 : null

  return (
    <DashboardPage>
      <DashboardPageHeader title="Relatórios" description="Indicadores factuais calculados a partir da base de dados. Esta página não produz conclusões automáticas sem evidência." />

      <DashboardStatGrid>
        <DashboardStat label="Utilizadores" value={users.count ?? 0} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Profissionais" value={professionals.count ?? 0} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Espaços" value={spaces.count ?? 0} icon={<Building2 className="h-5 w-5" />} />
        <DashboardStat label="Eventos" value={events.count ?? 0} icon={<Calendar className="h-5 w-5" />} />
      </DashboardStatGrid>

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardSection title="Atividade" description="Volumes acumulados registados na plataforma.">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reservas</p><p className="mt-2 text-2xl font-bold">{totalReservations}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Concluídas</p><p className="mt-2 text-2xl font-bold">{completed}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Taxa conclusão</p><p className="mt-2 text-2xl font-bold">{completionRate === null ? '—' : `${completionRate.toFixed(1)}%`}</p></div>
            <div className="rounded-xl border border-border p-4"><p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Star className="h-3.5 w-3.5" />Avaliações</p><p className="mt-2 text-2xl font-bold">{reviews.count ?? 0}</p></div>
          </div>
        </DashboardSection>

        <DashboardSection title="Leitura dos dados" description="O painel apresenta métricas; interpretações de negócio devem ser feitas com contexto temporal e financeiro.">
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>Os números apresentados são totais atuais da base de dados e não representam, por si só, crescimento, retenção ou saúde do negócio.</p>
            <p>Para análise de tendência será necessário adicionar séries temporais confiáveis, coortes e métricas financeiras reconciliadas.</p>
          </div>
        </DashboardSection>
      </div>
    </DashboardPage>
  )
}
