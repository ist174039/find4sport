import { redirect } from 'next/navigation'
import { ShieldCheck, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { DashboardEmptyState, DashboardErrorState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

export default async function AdministradoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')
  if (access.adminType !== 'general') redirect('/admin?error=general_admin_required')

  const admin = createAdminClient()
  const { data: admins, error } = await admin.from('admins').select('id,auth_user_id,full_name,admin_type,is_active,created_at').order('created_at', { ascending: false })
  if (error) return <DashboardPage><DashboardPageHeader title="Administradores" description="Contas internas de administração, separadas dos utilizadores da plataforma." /><DashboardErrorState title="Não foi possível carregar os administradores" description={error.message} /></DashboardPage>

  const rows = await Promise.all((admins || []).map(async row => {
    const { data } = await admin.auth.admin.getUserById(row.auth_user_id)
    return { ...row, email: data?.user?.email || null }
  }))
  const active = rows.filter(row => row.is_active !== false).length

  return <DashboardPage>
    <DashboardPageHeader title="Administradores" description="Contas internas com acesso ao backoffice. Esta área é exclusiva do Administrador Geral." />
    <DashboardStatGrid>
      <DashboardStat label="Administradores" value={rows.length} icon={<Users className="h-5 w-5" />} />
      <DashboardStat label="Ativos" value={active} icon={<ShieldCheck className="h-5 w-5" />} />
    </DashboardStatGrid>
    <DashboardSection title="Equipa administrativa" description="Estas contas não são utilizadores funcionais da plataforma. Atribuição e alteração de permissões deve ser controlada pelo Administrador Geral.">
      {rows.length === 0 ? <DashboardEmptyState icon={<ShieldCheck className="h-10 w-10" />} title="Sem administradores" description="Não existem contas administrativas registadas." /> : <div className="grid gap-3">{rows.map(row => <article key={row.id} className="flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold">{row.full_name || 'Administrador'}</p><p className="truncate text-xs text-muted-foreground">{row.email || row.auth_user_id}</p><p className="mt-1 text-xs text-muted-foreground">Criado: {row.created_at ? new Date(row.created_at).toLocaleDateString('pt-PT') : '—'}</p></div><div className="flex flex-wrap gap-2"><Badge variant="outline">{row.admin_type === 'general' ? 'Administrador Geral' : row.admin_type}</Badge><Badge variant={row.is_active === false ? 'secondary' : 'default'}>{row.is_active === false ? 'Inativo' : 'Ativo'}</Badge></div></article>)}</div>}
    </DashboardSection>
  </DashboardPage>
}
