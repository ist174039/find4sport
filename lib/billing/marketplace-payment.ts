import 'server-only'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

type MarketplaceAudience = 'professional' | 'venue_manager'
type PlanCode = 'free' | 'pro' | 'premium'
export type MarketplacePaymentQuote = { providerUserId: string; audience: MarketplaceAudience; stripeAccountId: string; planCode: PlanCode; baseAmountCents: number; customerFeeCents: number; totalAmountCents: number; commissionCents: number; applicationFeeCents: number; commissionRate: number; customerFeeRate: number }
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing'])

function clampRate(value: unknown, fallback = 0) { const numeric = Number(value); return Number.isFinite(numeric) ? Math.min(100, Math.max(0, numeric)) : fallback }
function validConnectAccount(value: unknown) { const id = String(value || '').trim(); return /^acct_[A-Za-z0-9]{16,}$/.test(id) ? id : null }
function isMarketplaceAudience(value: string | null): value is MarketplaceAudience { return value === 'professional' || value === 'venue_manager' }
function resolvePlanCode(tier: string | null | undefined, active: boolean): PlanCode { return active && (tier === 'pro' || tier === 'premium') ? tier : 'free' }

async function assertConnectAccountReady(accountId: string) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Stripe não está configurado no servidor.')
  const stripe = new Stripe(key)
  const account = await stripe.accounts.retrieve(accountId)
  if ('deleted' in account && account.deleted) throw new Error('A conta Stripe Connect do prestador já não está disponível.')
  const requirementsDue = account.requirements?.currently_due || []
  if (!account.details_submitted || !account.charges_enabled || !account.payouts_enabled || requirementsDue.length > 0) {
    throw new Error('O prestador ainda não concluiu a configuração Stripe Connect. O pagamento não pode ser iniciado.')
  }
}

export async function resolveMarketplacePaymentQuote(providerUserId: string, baseAmountCents: number, destinationAccountId?: string | null): Promise<MarketplacePaymentQuote> {
  if (!providerUserId) throw new Error('Prestador inválido para pagamento.')
  if (!Number.isInteger(baseAmountCents) || baseAmountCents <= 0) throw new Error('Valor base inválido para pagamento.')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('platform_users').select('type').eq('id', providerUserId).maybeSingle()
  if (!profile || !isMarketplaceAudience(profile.type)) throw new Error('O destinatário do pagamento não é um prestador válido.')
  const audience = profile.type

  let stripeAccountId = validConnectAccount(destinationAccountId)
  if (!stripeAccountId && audience === 'professional') {
    const { data: professional } = await admin.from('professionals').select('stripe_account_id,status').eq('user_id', providerUserId).maybeSingle()
    if (!professional || professional.status !== 'active') throw new Error('O profissional não está ativo para receber pagamentos.')
    stripeAccountId = validConnectAccount(professional.stripe_account_id)
  }
  if (!stripeAccountId && audience === 'venue_manager') {
    const { data: space } = await admin.from('sport_spaces').select('stripe_account_id,status').eq('owner_user_id', providerUserId).not('stripe_account_id', 'is', null).order('created_at', { ascending: true }).limit(1).maybeSingle()
    if (!space || space.status !== 'active') throw new Error('O espaço não está ativo para receber pagamentos.')
    stripeAccountId = validConnectAccount(space.stripe_account_id)
  }
  if (!stripeAccountId) throw new Error('O prestador ainda não concluiu a configuração Stripe Connect. O pagamento não pode ser iniciado.')

  await assertConnectAccountReady(stripeAccountId)

  const { data: subscription } = await admin.from('user_subscriptions').select('plan_id,tier,status').eq('user_id', providerUserId).maybeSingle()
  const active = Boolean(subscription && ACTIVE_SUBSCRIPTION_STATUSES.has(String(subscription.status)))
  const planCode = resolvePlanCode(subscription?.tier, active)
  let plan: { commission_rate: number | null; customer_service_fee_rate: number | null } | null = null
  if (active && subscription?.plan_id) {
    plan = (await admin.from('subscription_plans').select('commission_rate,customer_service_fee_rate').eq('id', subscription.plan_id).eq('is_active', true).maybeSingle()).data
  }
  if (!plan) {
    plan = (await admin.from('subscription_plans').select('commission_rate,customer_service_fee_rate').eq('audience', audience).eq('code', planCode).eq('is_active', true).maybeSingle()).data
  }

  const commissionRate = clampRate(plan?.commission_rate, 15)
  const customerFeeRate = clampRate(plan?.customer_service_fee_rate, 0)
  const commissionCents = Math.round(baseAmountCents * commissionRate / 100)
  const customerFeeCents = Math.round(baseAmountCents * customerFeeRate / 100)
  const totalAmountCents = baseAmountCents + customerFeeCents
  const applicationFeeCents = Math.min(totalAmountCents, commissionCents + customerFeeCents)
  return { providerUserId, audience, stripeAccountId, planCode, baseAmountCents, customerFeeCents, totalAmountCents, commissionCents, applicationFeeCents, commissionRate, customerFeeRate }
}

export function marketplacePaymentIntentData(quote: MarketplacePaymentQuote, metadata: Record<string, string>) {
  const fullMetadata = { ...metadata, provider_user_id: quote.providerUserId, connected_account_id: quote.stripeAccountId, plan_code: quote.planCode, base_amount_cents: String(quote.baseAmountCents), customer_fee_cents: String(quote.customerFeeCents), platform_commission_cents: String(quote.commissionCents), application_fee_cents: String(quote.applicationFeeCents), commission_rate: String(quote.commissionRate), customer_fee_rate: String(quote.customerFeeRate) }
  const deferred = ['service_reservation', 'space_reservation'].includes(metadata.transaction_type)
  return deferred
    ? { metadata: fullMetadata, transfer_group: `f4s:${metadata.transaction_type}:${metadata.reservation_id || 'pending'}` }
    : { application_fee_amount: quote.applicationFeeCents, transfer_data: { destination: quote.stripeAccountId }, metadata: fullMetadata }
}

export function marketplaceLineItems(quote: MarketplacePaymentQuote, name: string, description?: string) {
  const items = [{ price_data: { currency: 'eur', product_data: { name, ...(description ? { description } : {}) }, unit_amount: quote.baseAmountCents }, quantity: 1 }]
  if (quote.customerFeeCents > 0) items.push({ price_data: { currency: 'eur', product_data: { name: 'Taxa de serviço Find4Sport', description: 'Taxa de serviço apresentada antes da confirmação do pagamento.' }, unit_amount: quote.customerFeeCents }, quantity: 1 })
  return items
}
