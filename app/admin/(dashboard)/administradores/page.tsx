import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShieldCheck, UserCog, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

export default async function AdminAdministratorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const admin = createAdminClient()
  const { data: administrators, error } = await admin.from('admins').select('id,auth_user_id,email,admin_type,created_at').order('created_at', { ascending: true })
  if (error) throw new Error(`Não foi possível carregar os administradores: ${error.message}`)
  const rows = administrators || []
  const general = rows.filter(row => row.admin_type === 'general').length

  return <DashboardPage>
    <DashboardPageHeader
      title="Administradores"
      description="Contas administrativas separadas dos utilizadores da plataforma. O acesso administrativo é determinado exclusivamente pela tabela admins."
      action={<Button asChild variant="outline"><Link href="/admin/utilizadores"><Users className="mr-2 h-4 w-4" />Utilizadores da plataforma</Link></Button>}
    />
    <DashboardStatGrid>
      <DashboardStat label="Administradores" value={rows.length} icon={<UserCog className="h-5 w-5" />} />
      <DashboardStat label="Gerais" value={general} icon={<ShieldCheck className="h-5 w-5" />} />
    </DashboardStatGrid>
    <DashboardSection title="Contas administrativas" description="Estas identidades não são misturadas com atletas, profissionais ou gestores de espaço.">
      {rows.length === 0 ? <DashboardEmptyState icon={<UserCog className="h-10 w-10" />} title="Sem administradores" description="Nenhuma conta administrativa foi encontrada." /> : <div className="grid gap-3">
        {rows.map(row => <article key={row.id} className="flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><p className="truncate font-semibold">{row.email}</p><p className="mt-1 truncate font-mono text-xs text-muted-foreground">Auth: {row.auth_user_id || 'não associado'}</p><p className="mt-1 text-xs text-muted-foreground">Criado em {new Date(row.created_at).toLocaleString('pt-PT')}</p></div>
          <div className="flex flex-wrap gap-2"><Badge variant="secondary">{row.admin_type}</Badge><Badge variant="outline">Admin</Badge></div>
        </article>)}
      </div>}
    </DashboardSection>
  </DashboardPage>
}
