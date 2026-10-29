import { test, expect } from '@playwright/test'

// This suite runs against the actual Next.js candidate with a loopback-only
// synthetic Supabase fixture. It is UI E2E, NOT managed-Supabase integration E2E.
const routes = ['/', '/profissionais', '/espacos', '/eventos', '/comunidades', '/auth/login']

for (const route of routes) {
  test(`public page ${route} renders with isolated synthetic data`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(response).not.toBeNull()
    expect(response.status(), `${route} failed`).toBeLessThan(500)
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('body')).not.toContainText('Application error')
  })
}

test('synthetic service health and app headers are observable', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.status()).toBe(200)
  const payload = await response.json()
  expect(payload.status).toBe('ok')
  expect(payload.checks.database).toBe('ok')
  expect(response.headers()['x-content-type-options']).toBe('nosniff')
  expect(response.headers()['x-frame-options']).toBe('DENY')
})

test('anonymous dashboard and admin navigation remain protected', async ({ page }) => {
  for (const route of ['/dashboard', '/dashboard/agenda', '/admin', '/admin/utilizadores']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    const expected = route.startsWith('/admin') ? /\/admin\/login(?:\?|$)/ : /\/auth\/login(?:\?|$)/
    await expect(page, `Anonymous route ${route} must redirect to login`).toHaveURL(expected)
  }
})

test('unauthenticated user cannot access sensitive checkout API', async ({ request }) => {
  for (const route of ['/api/checkout_sessions', '/api/package-checkout', '/api/stripe/checkout']) {
    const response = await request.post(route, { data: {} })
    expect(response.status(), route).toBeGreaterThanOrEqual(400)
    expect(response.status(), route).toBeLessThan(500)
  }
})

for (const route of ['/profissionais', '/espacos', '/eventos']) {
  test(`search in ${route} changes query without carrying stale pagination`, async ({ page }) => {
    const response = await page.goto(`${route}?page=3&q=padel&location=Lisboa&priceMin=10`, { waitUntil: 'domcontentloaded' })
    expect(response.status()).toBeLessThan(400)
    await page.getByRole('textbox', { name: 'Pesquisar', exact: true }).fill('tenis')
    await page.getByRole('button', { name: 'Pesquisar', exact: true }).click()
    await expect(page).toHaveURL(url => url.searchParams.get('q') === 'tenis' && !url.searchParams.has('page'))
    expect(new URL(page.url()).searchParams.get('location')).toBe('Lisboa')
  })
}

test('a missing route fails closed rather than 500', async ({ page }) => {
  const response = await page.goto('/e2e-path-must-not-exist')
  expect(response.status()).toBe(404)
})

test('all public routes fit mobile viewport at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    const dims = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      width: document.documentElement.clientWidth,
    }))
    expect(dims.scroll, `Horizontal overflow in ${route}`).toBeLessThanOrEqual(dims.width + 2)
  }
})
