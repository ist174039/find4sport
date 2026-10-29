import { test, expect } from '@playwright/test';

// No Stripe API keys or webhook secrets. Requests are unsigned or deliberately
// invalid, and therefore must not reach persistence or create payments.
test('Stripe webhook rejects missing signature without processing event', async ({ request }) => {
  const r = await request.post('/api/webhooks/stripe', {
    data: '{}', headers: { 'content-type': 'application/json' },
  });
  expect(r.status()).toBe(400);
});

test('Stripe webhook rejects forged signature', async ({ request }) => {
  const r = await request.post('/api/webhooks/stripe', {
    data: '{"id":"evt_e2e_forged","type":"checkout.session.completed"}',
    headers: { 'content-type': 'application/json', 'stripe-signature': 't=1,v1=invalid' },
  });
  expect(r.status()).toBe(400);
});

test('subscription checkout rejects unauthenticated requests', async ({ request }) => {
  const r = await request.post('/api/stripe/checkout', {
    data: { planCode: 'pro', billingCycle: 'monthly' },
  });
  expect(r.status()).toBe(401);
});
