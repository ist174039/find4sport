import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserDashboard } from '@/components/dashboard/user-dashboard'
import { ProfessionalDashboard } from '@/components/dashboard/professional-dashboard'
import { SpaceDashboard } from '@/components/dashboard/space-dashboard'
import { resolveSessionAccess } from '@/lib/auth/access'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard')
  }

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !access.canAccessDashboard) {
    redirect('/auth/login?redirect=/dashboard')
  }

  if (access.role === 'venue_manager') {
    const { data: space } = await supabase
      .from('sport_spaces')
      .select('*')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!space) {
      redirect('/auth/registar/espaco')
    }

    return <SpaceDashboard space={space} />
  }

  if (access.role === 'professional') {
    const [{ data: professional }, { data: sub }] = await Promise.all([
      supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

    if (!professional) {
      redirect('/auth/registar/profissional')
    }

    return <ProfessionalDashboard professional={professional} subscriptionTier={sub?.tier || 'free'} />
  }

  return <UserDashboard user={user} />
}
