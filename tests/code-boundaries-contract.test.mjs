import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const route = await readFile(new URL('../app/api/stripe/checkout/route.ts', import.meta.url), 'utf8')
const handler = await readFile(new URL('../lib/billing/subscription-checkout-handler.ts', import.meta.url), 'utf8')
const guide = await readFile(new URL('../docs/CODE_BOUNDARIES.md', import.meta.url), 'utf8')

test('subscription checkout keeps provider construction in the route wrapper', () => {
  assert.match(route, /createSubscriptionCheckoutHandler/)
  assert.match(route, /createClient/)
  assert.match(route, /createAdminClient/)
  assert.match(route, /new Stripe/)
  assert.doesNotMatch(handler, /next\/server|@\/lib\/supabase|from ['"]stripe['"]|process\.env/)
})

test('module boundary guide documents dependency direction and pilot', () => {
  assert.match(guide, /UI -> App Router boundary -> pure domain\/service -> infrastructure adapter \/ database/)
  assert.match(guide, /Pilot: subscription checkout/)
  assert.match(guide, /service-role use remains server-only/)
  assert.match(guide, /does not claim every existing module already follows it/)
})
