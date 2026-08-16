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

  if (access.role === 'professional' && !access.hasProfessionalProfile) {
    redirect('/auth/registar/profissional')
  }

  if (access.role === 'venue_manager' && !access.hasManagedSpace) {
    redirect('/auth/registar/espaco')
  }

  const [professionalResult, spaceResult] = await Promise.all([
    access.role === 'professional'
      ? supabase.from('professionals').select('*').eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    access.role === 'venue_manager'
      ? supabase
          .from('sport_spaces')
          .select('*')
          .eq('owner_user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const professional = professionalResult.data
  const space = spaceResult.data

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-muted/30">
      <div className="flex w-full">
        <DashboardSidebar
          role={access.role}
          professional={professional}
          space={space}
          user={user}
          notificationCount={count || 0}
        />
        <main className="ml-0 w-full min-w-0 flex-1 px-4 pb-6 pt-20 sm:px-6 lg:ml-64 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
