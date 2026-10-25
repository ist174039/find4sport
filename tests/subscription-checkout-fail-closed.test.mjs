import test from 'node:test'
import assert from 'node:assert/strict'
import { createSubscriptionCheckoutHandler } from '../lib/billing/subscription-checkout-handler.ts'

function createAdmin(responses) {
  const calls = []
  return {
    calls,
    client: {
      from(table) {
        const call = { table, filters: [], columns: null }
        calls.push(call)
        const queue = responses[table] || []
        return {
          select(columns) { call.columns = columns; return this },
          eq(column, value) { call.filters.push([column, value]); return this },
          async maybeSingle() {
            const next = queue.shift()
            return next || { data: null, error: null }
          },
        }
      },
    },
  }
}

function createStripe() {
  const calls = { checkout: [], portal: [] }
  return {
    calls,
    client: {
      checkout: {
        sessions: {
          async create(params) {
            calls.checkout.push(params)
            return { url: 'https://checkout.stripe.test/session' }
          },
        },
      },
      billingPortal: {
        sessions: {
          async create(params) {
            calls.portal.push(params)
            return { url: 'https://billing.stripe.test/session' }
          },
        },
      },
    },
  }
}

function request(body = { planCode: 'pro', billingCycle: 'monthly' }) {
  return new Request('https://find4sport.example/api/stripe/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function handler(responses, { user = { id: 'user-1', email: 'user@example.invalid' }, stripe = createStripe() } = {}) {
  const admin = createAdmin(responses)
  const checkout = createSubscriptionCheckoutHandler({
    createUserClient: async () => ({ auth: { getUser: async () => ({ data: { user } }) } }),
    createAdminClient: () => admin.client,
    getTrustedApplicationOrigin: () => 'https://find4sport.example',
    stripe: stripe.client,
  })
  return { checkout, admin, stripe }
}

const PROFILE = { data: { type: 'professional' }, error: null }
const PLAN = {
  data: {
    id: 'plan-pro',
    code: 'pro',
    name: 'Pro',
    stripe_monthly_price_id: 'price_monthly',
    stripe_annual_price_id: 'price_annual',
    is_active: true,
    is_public: true,
  },
  error: null,
}

test('subscription lookup failure returns 503 and never invokes Stripe', async () => {
  const { checkout, stripe } = handler({
    platform_users: [PROFILE],
    subscription_plans: [PLAN],
    user_subscriptions: [{ data: null, error: new Error('db unavailable') }],
  })

  const response = await checkout(request())
  assert.equal(response.status, 503)
  assert.match((await response.json()).error, /subscrição atual/)
  assert.equal(stripe.calls.checkout.length, 0)
  assert.equal(stripe.calls.portal.length, 0)
})

test('plan lookup failure returns 404 before any Stripe call', async () => {
  const { checkout, stripe } = handler({
    platform_users: [PROFILE],
    subscription_plans: [{ data: null, error: new Error('db unavailable') }],
  })

  const response = await checkout(request())
  assert.equal(response.status, 404)
  assert.equal(stripe.calls.checkout.length, 0)
  assert.equal(stripe.calls.portal.length, 0)
})

test('managed subscription opens billing portal without creating checkout', async () => {
  const { checkout, stripe } = handler({
    platform_users: [PROFILE],
    subscription_plans: [PLAN],
    user_subscriptions: [{
      data: {
        stripe_customer_id: 'cus_test',
        stripe_subscription_id: 'sub_test',
        status: 'active',
      },
      error: null,
    }],
  })

  const response = await checkout(request())
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.mode, 'portal')
  assert.equal(stripe.calls.portal.length, 1)
  assert.equal(stripe.calls.checkout.length, 0)
})

test('eligible user without managed subscription creates one checkout session', async () => {
  const { checkout, stripe } = handler({
    platform_users: [PROFILE],
    subscription_plans: [PLAN],
    user_subscriptions: [{ data: null, error: null }],
  })

  const response = await checkout(request())
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.mode, 'checkout')
  assert.equal(stripe.calls.checkout.length, 1)
  assert.equal(stripe.calls.portal.length, 0)
  assert.equal(stripe.calls.checkout[0].client_reference_id, 'user-1')
  assert.deepEqual(stripe.calls.checkout[0].line_items, [{ price: 'price_monthly', quantity: 1 }])
})
