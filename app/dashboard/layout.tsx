import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

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

  // Check if user has a professional profile
  let { data: professional } = await supabase
    .from('professionals')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Check if user has a space profile
  const { data: space } = await supabase
    .from('sport_spaces')
    .select('*')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!professional && !space) {
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('type, full_name')
      .eq('id', user.id)
      .maybeSingle()

    const userType = platformUser?.type || user.user_metadata?.type

    if (userType === 'professional' || userType === 'profissional') {
      const { data: newProf } = await supabase
        .from('professionals')
        .insert({
          user_id: user.id,
          full_name: platformUser?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Profissional',
          email: user.email!,
          status: 'pending',
        })
        .select('*')
        .maybeSingle()

      professional = newProf
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 w-full overflow-x-hidden">
      <div className="flex w-full">
        <DashboardSidebar professional={professional} space={space} />
        <main className="flex-1 w-full min-w-0 p-6 pt-20 lg:p-8 ml-0 lg:ml-64">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
