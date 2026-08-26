import { redirect } from 'next/navigation'
import { AdministratorsManager } from '@/components/admin/administrators-manager'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { DashboardErrorState, DashboardPage, DashboardPageHeader } from '@/components/patterns/dashboard-page'

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
    if (!row.auth_user_id) return { ...row, active: false }
    const { data } = await admin.auth.admin.getUserById(row.auth_user_id)
    return { ...row, email: data?.user?.email || row.email, active: Boolean(data?.user && !data.user.banned_until) }
  }))

  return (
    <DashboardPage><AdministratorsManager initialRows={rows as any} /></DashboardPage>
  )
}
