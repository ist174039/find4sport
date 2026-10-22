import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolveMarketplacePaymentQuoteWithClient } from '../lib/billing/marketplace-payment-quote.ts'

const ACCOUNT_ID = 'acct_1234567890abcdef'
const PROFESSIONAL = { type: 'professional' }
const ACTIVE_PROFESSIONAL = { stripe_account_id: ACCOUNT_ID, status: 'active' }
const FREE_PLAN = { commission_rate: 15, customer_service_fee_rate: 0 }

function createAdmin(responses) {
  const calls = []
  return {
    calls,
    client: {
      from(table) {
        calls.push({ table, filters: [], columns: null, orderBy: [], resultLimit: null })
        const call = calls.at(-1)
        return {
          select(columns) { call.columns = columns; return this },
          eq(column, value) { call.filters.push([column, value]); return this },
          not(column, operator, value) { call.filters.push([column, operator, value]); return this },
          order(column, options) { call.orderBy.push([column, options]); return this },
          limit(count) { call.resultLimit = count; return this },
          async maybeSingle() {
            const tableResponses = responses[table] || []
            const next = tableResponses.shift()
            return next || { data: null, error: null }
          },
        }
      },
    },
  }
}

function input(responses, { destinationAccountId, accountReadyError } = {}) {
  const admin = createAdmin(responses)
  const readyAccounts = []
  return {
    admin,
    readyAccounts,
    resolve: () => resolveMarketplacePaymentQuoteWithClient(
      admin.client,
      'provider-1',
      10_000,
      destinationAccountId,
      async (accountId) => {
        readyAccounts.push(accountId)
        if (accountReadyError) throw accountReadyError
      },
    ),
  }
}

test('profile lookup error rejects instead of treating provider as missing', async () => {
  const { resolve, admin, readyAccounts } = input({ platform_users: [{ data: null, error: new Error('db unavailable') }] })
  await assert.rejects(resolve(), /Não foi possível verificar o tipo de prestador/)
  assert.deepEqual(admin.calls.map(({ table }) => table), ['platform_users'])
  assert.deepEqual(readyAccounts, [])
})

test('Connect owner lookup error rejects before a payment quote is produced', async () => {
  const { resolve, admin, readyAccounts } = input({
    platform_users: [{ data: PROFESSIONAL, error: null }],
    professionals: [{ data: null, error: new Error('db unavailable') }],
  })
  await assert.rejects(resolve(), /Não foi possível verificar a conta de pagamentos do profissional/)
  assert.deepEqual(admin.calls.map(({ table }) => table), ['platform_users', 'professionals'])
  assert.deepEqual(readyAccounts, [])
  assert.deepEqual(admin.calls[0].filters, [['id', 'provider-1']])
  assert.equal(admin.calls[0].columns, 'type')
})

test('venue manager space lookup error rejects before a payment quote is produced', async () => {
  const { resolve, admin, readyAccounts } = input({
    platform_users: [{ data: { type: 'venue_manager' }, error: null }],
    sport_spaces: [{ data: null, error: new Error('db unavailable') }],
  })
  await assert.rejects(resolve(), /Não foi possível verificar a conta de pagamentos do espaço/)
  assert.deepEqual(admin.calls.map(({ table }) => table), ['platform_users', 'sport_spaces'])
  assert.deepEqual(readyAccounts, [])
  assert.deepEqual(admin.calls[1].filters, [['owner_user_id', 'provider-1'], ['stripe_account_id', 'is', null]])
  assert.deepEqual(admin.calls[1].orderBy, [['created_at', { ascending: true }]])
  assert.equal(admin.calls[1].resultLimit, 1)
})

test('active venue manager space produces a quote with configured rates', async () => {
  const { resolve, admin, readyAccounts } = input({
    platform_users: [{ data: { type: 'venue_manager' }, error: null }],
    sport_spaces: [{ data: { stripe_account_id: ACCOUNT_ID, status: 'active' }, error: null }],
    user_subscriptions: [{ data: null, error: null }],
    subscription_plans: [{ data: { commission_rate: 12, customer_service_fee_rate: 3 }, error: null }],
  })
  const quote = await resolve()
  assert.equal(quote.audience, 'venue_manager')
  assert.equal(quote.commissionRate, 12)
  assert.equal(quote.customerFeeRate, 3)
  assert.deepEqual(readyAccounts, [ACCOUNT_ID])
  assert.deepEqual(admin.calls[0].filters, [['id', 'provider-1']])
})

test('subscription lookup error rejects rather than switching to the free plan', async () => {
  const { resolve, admin, readyAccounts } = input({
    platform_users: [{ data: PROFESSIONAL, error: null }],
    professionals: [{ data: ACTIVE_PROFESSIONAL, error: null }],
    user_subscriptions: [{ data: null, error: new Error('db unavailable') }],
  })
  await assert.rejects(resolve(), /Não foi possível verificar o plano de subscrição/)
  assert.deepEqual(admin.calls.map(({ table }) => table), ['platform_users', 'professionals', 'user_subscriptions'])
  assert.deepEqual(readyAccounts, [ACCOUNT_ID])
})

test('plan lookup error rejects instead of using a fallback commission or service fee', async () => {
  const { resolve, admin } = input({
    platform_users: [{ data: PROFESSIONAL, error: null }],
    professionals: [{ data: ACTIVE_PROFESSIONAL, error: null }],
    user_subscriptions: [{ data: null, error: null }],
    subscription_plans: [{ data: null, error: new Error('db unavailable') }],
  })
  await assert.rejects(resolve(), /Não foi possível verificar as taxas do plano/)
  assert.equal(admin.calls.at(-1).table, 'subscription_plans')
})

test('active subscription plan lookup error rejects instead of querying a fallback plan', async () => {
  const { resolve, admin } = input({
    platform_users: [{ data: PROFESSIONAL, error: null }],
    professionals: [{ data: ACTIVE_PROFESSIONAL, error: null }],
    user_subscriptions: [{ data: { plan_id: 'plan-pro', tier: 'pro', status: 'active' }, error: null }],
    subscription_plans: [{ data: null, error: new Error('db unavailable') }],
  })
  await assert.rejects(resolve(), /Não foi possível verificar as taxas do plano de subscrição/)
  assert.equal(admin.calls.filter(({ table }) => table === 'subscription_plans').length, 1)
})

test('a non-ready Stripe Connect account rejects before subscription and plan lookups', async () => {
  const { resolve, admin, readyAccounts } = input({
    platform_users: [{ data: PROFESSIONAL, error: null }],
    professionals: [{ data: ACTIVE_PROFESSIONAL, error: null }],
  }, { accountReadyError: new Error('Connect account not ready') })
  await assert.rejects(resolve(), /Connect account not ready/)
  assert.deepEqual(readyAccounts, [ACCOUNT_ID])
  assert.deepEqual(admin.calls.map(({ table }) => table), ['platform_users', 'professionals'])
})

test('a configured free plan returns the configured rates', async () => {
  const { resolve } = input({
    platform_users: [{ data: PROFESSIONAL, error: null }],
    professionals: [{ data: ACTIVE_PROFESSIONAL, error: null }],
    user_subscriptions: [{ data: null, error: null }],
    subscription_plans: [{ data: FREE_PLAN, error: null }],
  })
  const quote = await resolve()
  assert.equal(quote.planCode, 'free')
  assert.equal(quote.commissionRate, 15)
  assert.equal(quote.customerFeeRate, 0)
  assert.equal(quote.commissionCents, 1_500)
})

test('an active subscription uses its plan rates', async () => {
  const { resolve } = input({
    platform_users: [{ data: PROFESSIONAL, error: null }],
    professionals: [{ data: ACTIVE_PROFESSIONAL, error: null }],
    user_subscriptions: [{ data: { plan_id: 'plan-pro', tier: 'pro', status: 'active' }, error: null }],
    subscription_plans: [{ data: { commission_rate: 10, customer_service_fee_rate: 2 }, error: null }],
  })
  const quote = await resolve()
  assert.equal(quote.planCode, 'pro')
  assert.equal(quote.commissionRate, 10)
  assert.equal(quote.customerFeeRate, 2)
  assert.equal(quote.totalAmountCents, 10_200)
  assert.equal(quote.applicationFeeCents, 1_200)
})

test('trialing is billable while past_due, unpaid, paused and canceled use the configured free plan', async () => {
  for (const status of ['trialing', 'past_due', 'unpaid', 'paused', 'canceled']) {
    const active = status === 'trialing'
    const { resolve } = input({
      platform_users: [{ data: PROFESSIONAL, error: null }],
      professionals: [{ data: ACTIVE_PROFESSIONAL, error: null }],
      user_subscriptions: [{ data: { plan_id: 'plan-pro', tier: 'pro', status }, error: null }],
      subscription_plans: active
        ? [{ data: { commission_rate: 10, customer_service_fee_rate: 2 }, error: null }]
        : [{ data: FREE_PLAN, error: null }],
    })
    const quote = await resolve()
    assert.equal(quote.planCode, active ? 'pro' : 'free', `status ${status}`)
  }
})

test('missing plan configuration and invalid rates reject instead of producing a quote', async () => {
  const missingPlan = input({
    platform_users: [{ data: PROFESSIONAL, error: null }],
    professionals: [{ data: ACTIVE_PROFESSIONAL, error: null }],
    user_subscriptions: [{ data: null, error: null }],
  })
  await assert.rejects(missingPlan.resolve(), /taxas do plano do prestador não estão configuradas/)

  for (const commission_rate of [null, 'bad', -1, 101]) {
    const invalidRate = input({
      platform_users: [{ data: PROFESSIONAL, error: null }],
      professionals: [{ data: ACTIVE_PROFESSIONAL, error: null }],
      user_subscriptions: [{ data: null, error: null }],
      subscription_plans: [{ data: { commission_rate, customer_service_fee_rate: 0 }, error: null }],
    })
    await assert.rejects(invalidRate.resolve(), /taxa de comissão do plano é inválida/)
  }

  const invalidServiceRate = input({
    platform_users: [{ data: PROFESSIONAL, error: null }],
    professionals: [{ data: ACTIVE_PROFESSIONAL, error: null }],
    user_subscriptions: [{ data: null, error: null }],
    subscription_plans: [{ data: { commission_rate: 10, customer_service_fee_rate: null }, error: null }],
  })
  await assert.rejects(invalidServiceRate.resolve(), /taxa de serviço ao cliente do plano é inválida/)
})

test('all payment consumers resolve the quote before creating a Stripe Checkout session', async () => {
  const consumers = [
    ['../app/api/checkout_sessions/route.ts', 'await resolveMarketplacePaymentQuote(', 'stripe.checkout.sessions.create('],
    ['../app/api/package-checkout/route.ts', 'await resolveMarketplacePaymentQuote(', 'stripe.checkout.sessions.create('],
  ]
  for (const [path, quoteCall, checkoutCall] of consumers) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8')
    assert.ok(source.indexOf(quoteCall) >= 0, `${path} should resolve the quote`)
    assert.ok(source.indexOf(quoteCall) < source.indexOf(checkoutCall), `${path} should resolve the quote before Stripe Checkout`)
  }
})
