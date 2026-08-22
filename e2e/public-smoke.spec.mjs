import { test, expect } from '@playwright/test'

const publicRoutes = [
  '/',
  '/profissionais',
  '/espacos',
  '/eventos',
  '/comunidades',
  '/auth/login',
]

const protectedDashboardRoutes = [
  '/dashboard',
  '/dashboard/agenda',
  '/dashboard/reservas',
  '/dashboard/definicoes',
]

const protectedAdminRoutes = [
  '/admin',
  '/admin/utilizadores',
  '/admin/administradores',
  '/admin/faturacao',
  '/admin/relatorios',
  '/admin/importacao',
]

for (const route of publicRoutes) {
  test(`${route} loads without server error`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(response, `Expected an HTTP response for ${route}`).not.toBeNull()
    expect(response.status(), `${route} returned ${response.status()}`).toBeLessThan(500)
    await expect(page.locator('body')).toBeVisible()
  })
}

test('readiness healthcheck reports healthy dependencies', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.status()).toBe(200)
  const payload = await response.json()

  expect(payload.status).toBe('ok')
  expect(payload.checks?.database).toBe('ok')
  expect(payload.checks?.stripe).toBe('configured')
  expect(typeof payload.version).toBe('string')
  expect(response.headers()['cache-control']).toContain('no-store')
})

test('baseline security headers are present', async ({ request }) => {
  const response = await request.get('/')
  const headers = response.headers()

  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['x-frame-options']).toBe('DENY')
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
})

test('login rejects invalid credentials with a user-facing error', async ({ page }) => {
  await page.goto('/auth/login')

  await page.getByLabel('E-mail').fill('e2e-invalid-user@example.invalid')
  await page.getByLabel('Palavra-passe').fill('invalid-password-for-smoke-test')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('alert')).toContainText(/incorretos|não foi possível/i)
})

test('login redirect input cannot escape the application origin', async ({ page }) => {
  await page.goto('/auth/login?next=https://example.com')
  const registerHref = await page.getByRole('link', { name: 'Criar conta' }).getAttribute('href')

  expect(registerHref).toContain('next=%2Fdashboard')
  expect(registerHref).not.toContain('example.com')
})

test('anonymous users are denied across dashboard surface', async ({ page }) => {
  for (const route of protectedDashboardRoutes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await expect(page, `${route} must redirect anonymous users to login`).toHaveURL(/\/auth\/login(?:\?|$)/)
  }
})

test('anonymous users are denied across sensitive admin surface', async ({ page }) => {
  for (const route of protectedAdminRoutes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await expect(page, `${route} must redirect anonymous users to admin login`).toHaveURL(/\/admin\/login(?:\?|$)/)
  }
})

test('checkout endpoints reject anonymous requests without server errors', async ({ request }) => {
  for (const route of ['/api/checkout_sessions', '/api/package-checkout', '/api/stripe/checkout']) {
    const response = await request.post(route, { data: {} })
    expect(response.status(), `${route} unexpectedly accepted an anonymous checkout`).toBeGreaterThanOrEqual(400)
    expect(response.status(), `${route} returned a server error`).toBeLessThan(500)
  }
})

test('unknown public route returns a controlled client error, not a server failure', async ({ request }) => {
  const response = await request.get('/e2e-route-that-must-not-exist')
  expect(response.status()).toBeGreaterThanOrEqual(400)
  expect(response.status()).toBeLessThan(500)
})

test('mobile public pages do not overflow horizontally', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  for (const route of publicRoutes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))

    expect(
      dimensions.scrollWidth,
      `${route} overflows horizontally: ${dimensions.scrollWidth}px > ${dimensions.clientWidth}px`,
    ).toBeLessThanOrEqual(dimensions.clientWidth + 2)
  }
})
