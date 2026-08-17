import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardContentShell } from '@/components/dashboard/content-shell'
import { resolveSessionAccess } from '@/lib/auth/access'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard')

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !access.canAccessDashboard) redirect('/auth/login?redirect=/dashboard')
  if (access.role === 'admin') redirect('/admin')
  if (access.role === 'professional' && !access.hasProfessionalProfile) redirect('/auth/registar/profissional')
  if (access.role === 'venue_manager' && !access.hasManagedSpace) redirect('/auth/registar/espaco')

  const [professionalResult, spaceResult] = await Promise.all([
    access.role === 'professional'
      ? supabase.from('professionals').select('*').eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    access.role === 'venue_manager'
      ? supabase.from('sport_spaces').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).is('read_at', null)

  return <div className="min-h-screen w-full overflow-x-hidden bg-muted/30"><div className="flex w-full"><DashboardSidebar role={access.role} professional={professionalResult.data} space={spaceResult.data} user={user} notificationCount={count || 0} /><DashboardContentShell>{children}</DashboardContentShell></div></div>
}
