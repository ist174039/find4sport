import 'server-only'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveMarketplacePaymentQuoteWithClient, type MarketplacePaymentQuote, type MarketplacePaymentLookupClient } from '@/lib/billing/marketplace-payment-quote'
export type { MarketplacePaymentQuote } from '@/lib/billing/marketplace-payment-quote'

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
  return resolveMarketplacePaymentQuoteWithClient(
    createAdminClient() as unknown as MarketplacePaymentLookupClient,
    providerUserId,
    baseAmountCents,
    destinationAccountId,
    assertConnectAccountReady,
  )
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
