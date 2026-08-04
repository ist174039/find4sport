import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { resolveSessionAccess } from '@/lib/auth/access'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard')
  }

  const access = await resolveSessionAccess(supabase, user)

  if (!access || !access.canAccessDashboard) {
    redirect('/auth/login?redirect=/dashboard')
  }

  const [professionalResult, spaceResult] = await Promise.all([
    supabase
      .from('professionals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('sport_spaces')
      .select('*')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  const professional = professionalResult.data
  const space = spaceResult.data

  let notificationCount = 0
  if (user) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)
    
    notificationCount = count || 0
  }

  return (
    <div className="min-h-screen bg-muted/30 w-full overflow-x-hidden">
      <div className="flex w-full">
        <DashboardSidebar professional={professional} space={space} user={user} notificationCount={notificationCount} />
        <main className="flex-1 w-full min-w-0 p-6 pt-20 lg:p-8 ml-0 lg:ml-64">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
