import { test, expect } from '@playwright/test'

function credentials(prefix) {
  const email = process.env[`E2E_${prefix}_EMAIL`]
  const password = process.env[`E2E_${prefix}_PASSWORD`]
  return email && password ? { email, password } : null
}

async function loginUser(page, account) {
  await page.goto('/auth/login')
  await page.getByLabel('E-mail').fill(account.email)
  await page.getByLabel('Palavra-passe').fill(account.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).not.toHaveURL(/\/auth\/login(?:\?|$)/)
}

async function loginAdmin(page, account) {
  await page.goto('/admin/login')
  await page.getByLabel('Email Administrativo').fill(account.email)
  await page.getByLabel('Palavra-passe').fill(account.password)
  await page.getByRole('button', { name: 'Entrar no Painel' }).click()
  await expect(page).toHaveURL(/\/admin(?:\/|$)/)
}

async function expectProtectedPage(page, route) {
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
  expect(response, `Expected a response for ${route}`).not.toBeNull()
  expect(response.status(), `${route} returned a server error`).toBeLessThan(500)
  await expect(page).not.toHaveURL(/\/auth\/login(?:\?|$)/)
  await expect(page.locator('body')).toBeVisible()
}

for (const role of ['ATHLETE', 'PROFESSIONAL', 'VENUE_MANAGER']) {
  test(`${role.toLowerCase()} can authenticate and reach core dashboard pages`, async ({ page }) => {
    const account = credentials(role)
    test.skip(!account, `Missing E2E_${role}_EMAIL/PASSWORD credentials`)

    await loginUser(page, account)
    for (const route of ['/dashboard', '/dashboard/agenda', '/dashboard/definicoes']) {
      await expectProtectedPage(page, route)
    }
  })
}

test('a normal authenticated user is denied across the admin surface', async ({ page }) => {
  const account = credentials('ATHLETE')
  test.skip(!account, 'Missing E2E_ATHLETE_EMAIL/PASSWORD credentials')

  await loginUser(page, account)
  for (const route of ['/admin', '/admin/utilizadores', '/admin/administradores', '/admin/faturacao']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await expect(page, `${route} must deny a platform user`).toHaveURL(/\/admin\/login(?:\?|$)/)
  }
})

test('a general administrator can authenticate and reach the operational admin surface', async ({ page }) => {
  const account = credentials('ADMIN')
  test.skip(!account, 'Missing E2E_ADMIN_EMAIL/PASSWORD credentials')

  await loginAdmin(page, account)
  for (const route of ['/admin', '/admin/utilizadores', '/admin/relatorios']) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(response, `Expected a response for ${route}`).not.toBeNull()
    expect(response.status(), `${route} returned a server error`).toBeLessThan(500)
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/', '\\/')}(?:\\?|$)`))
    await expect(page.locator('body')).toBeVisible()
  }
})

test('general administrator can reach general-only administrator management', async ({ page }) => {
  const account = credentials('ADMIN')
  test.skip(!account, 'Missing E2E_ADMIN_EMAIL/PASSWORD credentials')

  await loginAdmin(page, account)
  const response = await page.goto('/admin/administradores', { waitUntil: 'domcontentloaded' })
  expect(response).not.toBeNull()
  expect(response.status()).toBeLessThan(500)
  await expect(page).toHaveURL(/\/admin\/administradores(?:\?|$)/)
  await expect(page.locator('body')).toBeVisible()
})

test('operational administrator can work operationally but is denied general-only administrator management', async ({ page }) => {
  const account = credentials('OPERATIONAL_ADMIN')
  test.skip(!account, 'Missing optional E2E_OPERATIONAL_ADMIN_EMAIL/PASSWORD credentials')

  await loginAdmin(page, account)

  for (const route of ['/admin', '/admin/utilizadores', '/admin/relatorios']) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(response, `Expected a response for ${route}`).not.toBeNull()
    expect(response.status(), `${route} returned a server error`).toBeLessThan(500)
    await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/', '\\/')}(?:\\?|$)`))
  }

  await page.goto('/admin/administradores', { waitUntil: 'domcontentloaded' })
  await expect(page).not.toHaveURL(/\/admin\/administradores(?:\?|$)/)
  await expect(page).toHaveURL(/\/admin(?:\?|$)/)
})
