import { test, expect } from '@playwright/test'

const discoveryRoutes = ['/espacos', '/profissionais', '/eventos']

async function openDiscovery(page, path) {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
  expect(response?.status(), `Discovery route must load before checking pagination: ${path}`).toBeLessThan(400)
}

function expectFirstPage(url, expectedFilters, removedFilters = []) {
  expect(url.searchParams.has('page')).toBe(false)
  for (const [name, value] of Object.entries(expectedFilters)) {
    expect(url.searchParams.get(name), `Expected ${name} to be preserved`).toBe(value)
  }
  for (const name of removedFilters) {
    expect(url.searchParams.has(name), `Expected ${name} to be removed`).toBe(false)
  }
}

for (const route of discoveryRoutes) {
  test(`${route}: a new search starts on page one and preserves filters`, async ({ page }) => {
    await openDiscovery(page, `${route}?page=3&q=padel&location=Lisboa&rating=4&priceMin=10`)
    await page.locator('input[placeholder^="Pesquisar "]').first().fill('tenis')
    await page.getByRole('button', { name: 'Pesquisar', exact: true }).click()

    await expect(page).toHaveURL(url => url.searchParams.get('q') === 'tenis' && !url.searchParams.has('page'))
    expectFirstPage(new URL(page.url()), { q: 'tenis', location: 'Lisboa', rating: '4', priceMin: '10' })
  })

  test(`${route}: applying a filter starts on page one and preserves the search`, async ({ page }) => {
    await openDiscovery(page, `${route}?page=3&q=padel&location=Lisboa&priceMin=10`)
    await page.locator('#filter-modal-trigger').click()
    const dialog = page.getByRole('dialog', { name: 'Filtros de pesquisa' })
    await expect(dialog).toBeVisible()
    await dialog.getByPlaceholder('Mínimo').fill('20')
    await dialog.getByRole('button', { name: 'Ver resultados' }).click()

    await expect(page).toHaveURL(url => url.searchParams.get('priceMin') === '20' && !url.searchParams.has('page'))
    expectFirstPage(new URL(page.url()), { q: 'padel', location: 'Lisboa', priceMin: '20' })
  })

  test(`${route}: clearing filters starts on page one and preserves the search`, async ({ page }) => {
    await openDiscovery(page, `${route}?page=3&q=padel&location=Lisboa&rating=4&priceMin=10&radius=25`)
    await page.locator('#filter-modal-trigger').click()
    await page.getByRole('dialog', { name: 'Filtros de pesquisa' }).getByRole('button', { name: 'Limpar', exact: true }).click()

    await expect(page).toHaveURL(url => !url.searchParams.has('priceMin') && !url.searchParams.has('page'))
    expectFirstPage(new URL(page.url()), { q: 'padel', location: 'Lisboa' }, ['rating', 'priceMin', 'radius'])
  })
}
