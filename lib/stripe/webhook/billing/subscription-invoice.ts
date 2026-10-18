import type Stripe from 'stripe'
import type { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/supabase-types'

type DbClient = ReturnType<typeof createAdminClient>
type SubscriptionStatus = Database['public']['Enums']['subscription_status']
type SubscriptionTier = Database['public']['Enums']['subscription_tier']

const asIso = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null

function normalizeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const statuses: readonly SubscriptionStatus[] = [
    'active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid', 'paused',
  ]
  return statuses.includes(status as SubscriptionStatus) ? status as SubscriptionStatus : 'incomplete'
}

function subscriptionPeriod(subscription: Stripe.Subscription) {
  const items = subscription.items.data
  if (items.length === 0) return { start: null, end: null }

  return {
    start: Math.max(...items.map((item) => item.current_period_start)),
    end: Math.min(...items.map((item) => item.current_period_end)),
  }
}

export async function syncSubscription(
  db: DbClient,
  subscription: Stripe.Subscription,
  forceCanceled = false,
) {
  const userId = subscription.metadata?.user_id
  const planId = subscription.metadata?.plan_id
  const planCode = subscription.metadata?.plan_code
  if (!userId || !planId || (planCode !== 'pro' && planCode !== 'premium')) {
    throw new Error(`Subscription ${subscription.id} missing Find4Sport metadata`)
  }

  const tier: SubscriptionTier = planCode
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id
  const status = forceCanceled ? 'canceled' : normalizeStatus(subscription.status)
  const period = subscriptionPeriod(subscription)
  const { error } = await db.from('user_subscriptions').upsert({
    user_id: userId,
    plan_id: planId,
    tier,
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscription.id,
    status,
    current_period_start: asIso(period.start),
    current_period_end: asIso(period.end),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) throw error
}

export async function persistInvoiceTransaction(
  db: DbClient,
  invoice: Stripe.Invoice,
  status: 'completed' | 'failed',
) {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
  if (!customerId) return

  const { data: subscriptionRow, error: subscriptionError } = await db.from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  if (subscriptionError) throw subscriptionError
  if (!subscriptionRow?.user_id) return

  const invoiceId = invoice.id
  const { data: existing, error: existingError } = await db.from('transactions')
    .select('id')
    .eq('stripe_charge_id', invoiceId)
    .maybeSingle()
  if (existingError) throw existingError

  const payload = {
    user_id: subscriptionRow.user_id,
    amount: (status === 'completed' ? invoice.amount_paid : invoice.amount_due) / 100,
    currency: invoice.currency || 'eur',
    type: 'subscription_payment',
    status,
    stripe_charge_id: invoiceId,
    financial_metadata: { invoice_id: invoiceId },
  }
  const result = existing
    ? await db.from('transactions').update(payload).eq('id', existing.id)
    : await db.from('transactions').insert(payload)
  if (result.error) throw result.error
}
