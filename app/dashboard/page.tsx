import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserDashboard } from '@/components/dashboard/user-dashboard'
import { ProfessionalDashboard } from '@/components/dashboard/professional-dashboard'
import { SpaceDashboard } from '@/components/dashboard/space-dashboard'
import { CurrentPlanSummary } from '@/components/dashboard/current-plan-summary'
import { resolveSessionAccess } from '@/lib/auth/access'

async function getSubscriptionContext(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, audience: 'professional' | 'venue_manager') {
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('tier, status, plan_id, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .maybeSingle()

  const tier = subscription?.tier || 'free'
  let plan: any = null

  if (subscription?.plan_id) {
    const result = await supabase
      .from('subscription_plans')
      .select('id, code, name, commission_rate')
      .eq('id', subscription.plan_id)
      .maybeSingle()
    plan = result.data
  }

  if (!plan) {
    const result = await supabase
      .from('subscription_plans')
      .select('id, code, name, commission_rate')
      .eq('audience', audience)
      .eq('code', tier)
      .maybeSingle()
    plan = result.data
  }

  return {
    tier,
    subscription,
    plan: plan || { name: tier === 'free' ? 'Grátis' : tier, commission_rate: null },
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/dashboard')

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !access.canAccessDashboard) redirect('/auth/login?redirect=/dashboard')

  if (access.role === 'venue_manager') {
    const [{ data: space }, billing] = await Promise.all([
      supabase
        .from('sport_spaces')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      getSubscriptionContext(supabase, user.id, 'venue_manager'),
    ])

    if (!space) redirect('/auth/registar/espaco')

    return (
      <>
        <CurrentPlanSummary
          planName={billing.plan.name}
          tier={billing.tier}
          commissionRate={billing.plan.commission_rate}
          status={billing.subscription?.status}
          currentPeriodEnd={billing.subscription?.current_period_end}
          cancelAtPeriodEnd={billing.subscription?.cancel_at_period_end}
        />
        <SpaceDashboard space={space} />
      </>
    )
  }

  if (access.role === 'professional') {
    const [{ data: professional }, billing] = await Promise.all([
      supabase
        .from('professionals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      getSubscriptionContext(supabase, user.id, 'professional'),
    ])

    if (!professional) redirect('/auth/registar/profissional')

    return (
      <>
        <CurrentPlanSummary
          planName={billing.plan.name}
          tier={billing.tier}
          commissionRate={billing.plan.commission_rate}
          status={billing.subscription?.status}
          currentPeriodEnd={billing.subscription?.current_period_end}
          cancelAtPeriodEnd={billing.subscription?.cancel_at_period_end}
        />
        <ProfessionalDashboard professional={professional} subscriptionTier={billing.tier} />
      </>
    )
  }

  return <UserDashboard user={user} />
}
