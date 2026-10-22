import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const route = await readFile(new URL('../app/api/stripe/checkout/route.ts', import.meta.url), 'utf8')

test('subscription lookup errors fail closed before creating checkout or billing portal sessions', () => {
  const queryIndex = route.indexOf(".from('user_subscriptions')")
  const errorGuardIndex = route.indexOf('if (subscriptionError)', queryIndex)
  const portalIndex = route.indexOf('stripe.billingPortal.sessions.create', queryIndex)
  const checkoutIndex = route.indexOf('stripe.checkout.sessions.create', queryIndex)

  assert.notEqual(queryIndex, -1)
  assert.ok(errorGuardIndex > queryIndex)
  assert.ok(errorGuardIndex < portalIndex)
  assert.ok(errorGuardIndex < checkoutIndex)
  assert.match(route, /data: existingSubscription, error: subscriptionError/)
  assert.match(route, /Não foi possível verificar a subscrição atual. Tente novamente./)
  assert.match(route, /\{ status: 503 \}/)
})

test('successful subscription lookup preserves the existing checkout and managed subscription portal paths', () => {
  assert.match(route, /MANAGED_SUBSCRIPTION_STATUSES\.has\(String\(existingSubscription\.status \|\| ''\)\)/)
  assert.match(route, /stripe\.billingPortal\.sessions\.create/)
  assert.match(route, /stripe\.checkout\.sessions\.create/)
})
