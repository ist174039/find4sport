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

  // Priority 1: Check if user has a space profile
  const { data: space } = await supabase
    .from('sport_spaces')
    .select('*')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (space) {
    return <SpaceDashboard space={space} />
  }

  // Priority 2: Check if user has a professional profile
  let { data: professional } = await supabase
    .from('professionals')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Auto-heal / fallback check for professional role
  if (!professional) {
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

  if (professional) {
    return <ProfessionalDashboard professional={professional} />
  }

  // Otherwise, normal user (Priority 3)
  return <UserDashboard user={user} />
}
