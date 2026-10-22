type MarketplaceAudience = 'professional' | 'venue_manager'
type PlanCode = 'free' | 'pro' | 'premium'

export type MarketplacePaymentQuote = {
  providerUserId: string
  audience: MarketplaceAudience
  stripeAccountId: string
  planCode: PlanCode
  baseAmountCents: number
  customerFeeCents: number
  totalAmountCents: number
  commissionCents: number
  applicationFeeCents: number
  commissionRate: number
  customerFeeRate: number
}

type LookupResult = { data: unknown; error: unknown | null }
type LookupQuery = {
  select(columns: string): LookupQuery
  eq(column: string, value: unknown): LookupQuery
  not(column: string, operator: string, value: unknown): LookupQuery
  order(column: string, options: { ascending: boolean }): LookupQuery
  limit(count: number): LookupQuery
  maybeSingle(): Promise<LookupResult>
}

export type MarketplacePaymentLookupClient = { from(table: string): LookupQuery }
type LookupRow = Record<string, unknown>
type MarketplacePlan = { commission_rate: unknown; customer_service_fee_rate: unknown }

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing'])

function validConnectAccount(value: unknown) {
  const id = String(value || '').trim()
  return /^acct_[A-Za-z0-9]{16,}$/.test(id) ? id : null
}

function isMarketplaceAudience(value: unknown): value is MarketplaceAudience {
  return value === 'professional' || value === 'venue_manager'
}

function resolvePlanCode(tier: unknown, active: boolean): PlanCode {
  return active && (tier === 'pro' || tier === 'premium') ? tier : 'free'
}

function requireRow(data: unknown, message: string): LookupRow {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(message)
  return data as LookupRow
}

function throwOnLookupError(error: unknown, message: string) {
  if (error) throw new Error(message, { cause: error })
}

function readRate(value: unknown, name: string) {
  if (value === null || value === undefined || value === '') {
    throw new Error(`A taxa ${name} do plano é inválida; o pagamento não pode ser iniciado.`)
  }
  const rate = Number(value)
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw new Error(`A taxa ${name} do plano é inválida; o pagamento não pode ser iniciado.`)
  }
  return rate
}

export async function resolveMarketplacePaymentQuoteWithClient(
  admin: MarketplacePaymentLookupClient,
  providerUserId: string,
  baseAmountCents: number,
  destinationAccountId: string | null | undefined,
  assertAccountReady: (accountId: string) => Promise<void>,
): Promise<MarketplacePaymentQuote> {
  if (!providerUserId) throw new Error('Prestador inválido para pagamento.')
  if (!Number.isInteger(baseAmountCents) || baseAmountCents <= 0) throw new Error('Valor base inválido para pagamento.')

  const profileResult = await admin.from('platform_users').select('type').eq('id', providerUserId).maybeSingle()
  throwOnLookupError(profileResult.error, 'Não foi possível verificar o tipo de prestador para o pagamento.')
  const profile = requireRow(profileResult.data, 'O destinatário do pagamento não é um prestador válido.')
  if (!isMarketplaceAudience(profile.type)) throw new Error('O destinatário do pagamento não é um prestador válido.')
  const audience = profile.type

  let stripeAccountId = validConnectAccount(destinationAccountId)
  if (!stripeAccountId && audience === 'professional') {
    const professionalResult = await admin.from('professionals').select('stripe_account_id,status').eq('user_id', providerUserId).maybeSingle()
    throwOnLookupError(professionalResult.error, 'Não foi possível verificar a conta de pagamentos do profissional.')
    const professional = professionalResult.data ? requireRow(professionalResult.data, 'O profissional não está ativo para receber pagamentos.') : null
    if (!professional || professional.status !== 'active') throw new Error('O profissional não está ativo para receber pagamentos.')
    stripeAccountId = validConnectAccount(professional.stripe_account_id)
  }
  if (!stripeAccountId && audience === 'venue_manager') {
    const spaceResult = await admin.from('sport_spaces').select('stripe_account_id,status').eq('owner_user_id', providerUserId).not('stripe_account_id', 'is', null).order('created_at', { ascending: true }).limit(1).maybeSingle()
    throwOnLookupError(spaceResult.error, 'Não foi possível verificar a conta de pagamentos do espaço.')
    const space = spaceResult.data ? requireRow(spaceResult.data, 'O espaço não está ativo para receber pagamentos.') : null
    if (!space || space.status !== 'active') throw new Error('O espaço não está ativo para receber pagamentos.')
    stripeAccountId = validConnectAccount(space.stripe_account_id)
  }
  if (!stripeAccountId) throw new Error('O prestador ainda não concluiu a configuração Stripe Connect. O pagamento não pode ser iniciado.')

  await assertAccountReady(stripeAccountId)

  const subscriptionResult = await admin.from('user_subscriptions').select('plan_id,tier,status').eq('user_id', providerUserId).maybeSingle()
  throwOnLookupError(subscriptionResult.error, 'Não foi possível verificar o plano de subscrição do prestador.')
  const subscription = subscriptionResult.data ? requireRow(subscriptionResult.data, 'O plano de subscrição do prestador é inválido.') : null
  const active = Boolean(subscription && ACTIVE_SUBSCRIPTION_STATUSES.has(String(subscription.status)))
  const planCode = resolvePlanCode(subscription?.tier, active)

  let plan: MarketplacePlan | null = null
  if (active && subscription?.plan_id) {
    const subscriptionPlanResult = await admin.from('subscription_plans').select('commission_rate,customer_service_fee_rate').eq('id', subscription.plan_id).eq('is_active', true).maybeSingle()
    throwOnLookupError(subscriptionPlanResult.error, 'Não foi possível verificar as taxas do plano de subscrição.')
    plan = subscriptionPlanResult.data ? requireRow(subscriptionPlanResult.data, 'As taxas do plano de subscrição são inválidas.') as MarketplacePlan : null
  }
  if (!plan) {
    const defaultPlanResult = await admin.from('subscription_plans').select('commission_rate,customer_service_fee_rate').eq('audience', audience).eq('code', planCode).eq('is_active', true).maybeSingle()
    throwOnLookupError(defaultPlanResult.error, 'Não foi possível verificar as taxas do plano do prestador.')
    plan = defaultPlanResult.data ? requireRow(defaultPlanResult.data, 'As taxas do plano do prestador são inválidas.') as MarketplacePlan : null
  }
  if (!plan) throw new Error('As taxas do plano do prestador não estão configuradas; o pagamento não pode ser iniciado.')

  const commissionRate = readRate(plan.commission_rate, 'de comissão')
  const customerFeeRate = readRate(plan.customer_service_fee_rate, 'de serviço ao cliente')
  const commissionCents = Math.round(baseAmountCents * commissionRate / 100)
  const customerFeeCents = Math.round(baseAmountCents * customerFeeRate / 100)
  const totalAmountCents = baseAmountCents + customerFeeCents
  const applicationFeeCents = Math.min(totalAmountCents, commissionCents + customerFeeCents)
  return { providerUserId, audience, stripeAccountId, planCode, baseAmountCents, customerFeeCents, totalAmountCents, commissionCents, applicationFeeCents, commissionRate, customerFeeRate }
}
