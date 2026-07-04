import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserDashboard } from '@/components/dashboard/user-dashboard'
import { ProfessionalDashboard } from '@/components/dashboard/professional-dashboard'
import { SpaceDashboard } from '@/components/dashboard/space-dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard')
  }

  // Check if user has a space profile (Priority 1: Spaces usually own the environment)
  const { data: space } = await supabase
    .from('sport_spaces')
    .select('*')
    .eq('owner_user_id', user.id)
    .single()

  if (space) {
    return <SpaceDashboard space={space} />
  }

  // Check if user has a professional profile (Priority 2)
  const { data: professional } = await supabase
    .from('professionals')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (professional) {
    return <ProfessionalDashboard professional={professional} />
  }

  // Otherwise, normal user (Priority 3)
  return <UserDashboard user={user} />
}
