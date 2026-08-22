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
  const { data: admins, error } = await admin
    .from('admins')
    .select('id,auth_user_id,email,admin_type,created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <DashboardPage>
        <DashboardPageHeader title="Administradores" description="Contas internas de administração, separadas dos utilizadores da plataforma." />
        <DashboardErrorState title="Não foi possível carregar os administradores" description={error.message} />
      </DashboardPage>
    )
  }

  const rows = await Promise.all((admins || []).map(async row => {
    if (!row.auth_user_id) return { ...row, authEmail: null }
    const { data } = await admin.auth.admin.getUserById(row.auth_user_id)
    return { ...row, authEmail: data?.user?.email || null }
  }))

  return (
    <DashboardPage>
      <DashboardPageHeader title="Administradores" description="Contas internas com acesso ao backoffice. Esta área é exclusiva do Administrador Geral." />
      <DashboardStatGrid>
        <DashboardStat label="Administradores" value={rows.length} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Administradores gerais" value={rows.filter(row => row.admin_type === 'general').length} icon={<ShieldCheck className="h-5 w-5" />} />
      </DashboardStatGrid>
      <DashboardSection title="Equipa administrativa" description="Estas contas não são utilizadores funcionais da plataforma. A atribuição e alteração de permissões deve ser controlada pelo Administrador Geral.">
        {rows.length === 0 ? (
          <DashboardEmptyState icon={<ShieldCheck className="h-10 w-10" />} title="Sem administradores" description="Não existem contas administrativas registadas." />
        ) : (
          <div className="grid gap-3">
            {rows.map(row => (
              <article key={row.id} className="flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{row.email || row.authEmail || 'Administrador'}</p>
                  {row.authEmail && row.authEmail !== row.email ? <p className="truncate text-xs text-muted-foreground">Auth: {row.authEmail}</p> : null}
                  <p className="mt-1 text-xs text-muted-foreground">Criado: {row.created_at ? new Date(row.created_at).toLocaleDateString('pt-PT') : '—'}</p>
                </div>
                <Badge variant="outline">{row.admin_type === 'general' ? 'Administrador Geral' : row.admin_type}</Badge>
              </article>
            ))}
          </div>
        )}
      </DashboardSection>
    </DashboardPage>
  )
}
