import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const handler = await readFile(new URL('../lib/billing/subscription-checkout-handler.ts', import.meta.url), 'utf8')

test('subscription lookup errors fail closed before creating checkout or billing portal sessions', () => {
  const queryIndex = handler.indexOf(".from('user_subscriptions')")
  const errorGuardIndex = handler.indexOf('if (subscriptionError)', queryIndex)
  const portalIndex = handler.indexOf('stripe.billingPortal.sessions.create', queryIndex)
  const checkoutIndex = handler.indexOf('stripe.checkout.sessions.create', queryIndex)

  assert.notEqual(queryIndex, -1)
  assert.ok(errorGuardIndex > queryIndex)
  assert.ok(errorGuardIndex < portalIndex)
  assert.ok(errorGuardIndex < checkoutIndex)
  assert.match(handler, /data: existingSubscription, error: subscriptionError/)
  assert.match(handler, /Não foi possível verificar a subscrição atual. Tente novamente./)
  assert.match(handler, /\{ status: 503 \}/)
})

test('successful subscription lookup preserves the existing checkout and managed subscription portal paths', () => {
  assert.match(handler, /MANAGED_SUBSCRIPTION_STATUSES\.has\(String\(existingSubscription\.status \|\| ''\)\)/)
  assert.match(handler, /stripe\.billingPortal\.sessions\.create/)
  assert.match(handler, /stripe\.checkout\.sessions\.create/)
})
