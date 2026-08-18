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

const dashboardRoles = {
  ATHLETE: {
    visible: ['Confirmações', 'Faturação e compras'],
    hidden: ['Serviços', 'Salas / Campos'],
    route: '/dashboard/confirmacoes',
  },
  PROFESSIONAL: {
    visible: ['Reservas', 'Serviços', 'Entregas e pagamentos'],
    hidden: ['Confirmações', 'Salas / Campos'],
    route: '/dashboard/servicos',
  },
  VENUE_MANAGER: {
    visible: ['Reservas', 'Salas / Campos', 'Entregas e pagamentos'],
    hidden: ['Confirmações', 'Serviços'],
    route: '/dashboard/espacos/salas',
  },
}

for (const [role, expectations] of Object.entries(dashboardRoles)) {
  test(`${role.toLowerCase()} can authenticate with the correct dashboard authorization`, async ({ page }) => {
    const account = credentials(role)
    test.skip(!account, `Missing E2E_${role}_EMAIL/PASSWORD credentials`)

    await loginUser(page, account)
    const response = await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })

    expect(response).not.toBeNull()
    expect(response.status()).toBeLessThan(500)
    await expect(page).not.toHaveURL(/\/auth\/login(?:\?|$)/)
    await expect(page.locator('body')).toBeVisible()

    for (const label of expectations.visible) {
      await expect(page.getByRole('link', { name: label, exact: true }).first()).toBeVisible()
    }
    for (const label of expectations.hidden) {
      await expect(page.getByRole('link', { name: label, exact: true })).toHaveCount(0)
    }

    const protectedResponse = await page.goto(expectations.route, { waitUntil: 'domcontentloaded' })
    expect(protectedResponse).not.toBeNull()
    expect(protectedResponse.status()).toBeLessThan(500)
    await expect(page).toHaveURL(new RegExp(expectations.route.replaceAll('/', '\\/')))
  })
}

test('a normal authenticated user cannot enter the admin area', async ({ page }) => {
  const account = credentials('ATHLETE')
  test.skip(!account, 'Missing E2E_ATHLETE_EMAIL/PASSWORD credentials')

  await loginUser(page, account)
  await page.goto('/admin', { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL(/\/admin\/login(?:\?|$)/)
})

test('an administrator can authenticate and reach the admin dashboard', async ({ page }) => {
  const account = credentials('ADMIN')
  test.skip(!account, 'Missing E2E_ADMIN_EMAIL/PASSWORD credentials')

  await loginAdmin(page, account)
  const response = await page.goto('/admin', { waitUntil: 'domcontentloaded' })

  expect(response).not.toBeNull()
  expect(response.status()).toBeLessThan(500)
  await expect(page).toHaveURL(/\/admin(?:\/|$)/)
  await expect(page.locator('body')).toBeVisible()
})
