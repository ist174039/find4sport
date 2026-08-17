import { test, expect } from '@playwright/test'

const publicRoutes = [
  '/',
  '/profissionais',
  '/espacos',
  '/eventos',
  '/comunidades',
  '/auth/login',
]

for (const route of publicRoutes) {
  test(`${route} loads without server error`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(response, `Expected an HTTP response for ${route}`).not.toBeNull()
    expect(response.status(), `${route} returned ${response.status()}`).toBeLessThan(500)
    await expect(page.locator('body')).toBeVisible()
  })
}

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
