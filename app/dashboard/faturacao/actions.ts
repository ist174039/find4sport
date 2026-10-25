'use server'

import { createClient } from '@/lib/supabase/server'

const TX_FIELDS = 'id,user_id,provider_user_id,amount,currency,type,status,created_at,source_type,source_id,stripe_charge_id,stripe_payment_intent_id,stripe_connected_account_id,stripe_transfer_id,gross_amount,base_amount,customer_fee_amount,platform_commission_amount,application_fee_amount,stripe_processing_fee_amount,provider_net_amount,platform_net_amount,commission_rate,customer_fee_rate,financial_metadata'
const PLAN_FIELDS = 'id,code,name,description,monthly_price,annual_price,commission_rate,customer_service_fee_rate,audience,entitlements:plan_entitlements(key,value_type,boolean_value,integer_value,decimal_value,text_value,is_unlimited)'
const RESERVATION_FIELDS = 'id,space_id,amount,status,date,start_time'

export async function getBillingDashboardData() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Sessão inválida. Inicia sessão novamente.')

  const { data: profile, error: profileError } = await supabase
    .from('platform_users').select('type').eq('id', user.id).maybeSingle()
  if (profileError) throw new Error('Não foi possível validar o perfil de faturação.')

  const role = profile?.type === 'professional' || profile?.type === 'venue_manager' || profile?.type === 'event_manager'
    ? profile.type : null

  const [subscriptionResult, transactionsResult, professionalResult, spacesResult] = await Promise.all([
    supabase.from('user_subscriptions')
      .select('tier,status,plan_id,current_period_end,cancel_at_period_end,stripe_customer_id')
      .eq('user_id', user.id).maybeSingle(),
    supabase.from('transactions').select(TX_FIELDS)
      .or(`user_id.eq.${user.id},provider_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false }).limit(500),
    supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('sport_spaces').select('id,name').eq('owner_user_id', user.id).order('created_at'),
  ])

  if (subscriptionResult.error || transactionsResult.error || professionalResult.error || spacesResult.error) {
    throw new Error('Não foi possível carregar os dados financeiros da conta.')
  }

  const spaces = spacesResult.data ?? []
  let plans: unknown[] = []
  if (role) {
    const plansResult = await supabase.from('subscription_plans').select(PLAN_FIELDS)
      .eq('audience', role).eq('is_active', true).eq('is_public', true).order('sort_order')
    if (plansResult.error) throw new Error('Não foi possível carregar os planos disponíveis.')
    plans = plansResult.data ?? []
  }

  const ownershipFilters: string[] = []
  if (professionalResult.data?.id) ownershipFilters.push(`professional_id.eq.${professionalResult.data.id}`)
  if (spaces.length) ownershipFilters.push(`space_id.in.(${spaces.map(space => space.id).join(',')})`)

  let reservations: unknown[] = []
  if (ownershipFilters.length) {
    const reservationsResult = await supabase.from('reservations').select(RESERVATION_FIELDS)
      .or(ownershipFilters.join(',')).order('date', { ascending: false }).limit(100)
    if (reservationsResult.error) throw new Error('Não foi possível carregar as reservas financeiras.')
    reservations = reservationsResult.data ?? []
  }

  return {
    userId: user.id,
    audience: role,
    subscription: subscriptionResult.data ?? { tier: 'free', status: 'active' },
    transactions: transactionsResult.data ?? [],
    spaces,
    plans,
    reservations,
    transactionsTruncated: (transactionsResult.data?.length ?? 0) === 500,
    reservationsTruncated: reservations.length === 100,
  }
}
