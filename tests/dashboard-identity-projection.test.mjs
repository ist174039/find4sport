import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const layout = await readFile(new URL('../app/dashboard/layout.tsx', import.meta.url), 'utf8')

test('dashboard sidebar fetches only the professional identity fields and scopes the read to the session user', () => {
  assert.match(layout, /from\('professionals'\)\.select\('full_name,professional_name,avatar_url'\)\.eq\('user_id', user\.id\)/)
  assert.doesNotMatch(layout, /from\('professionals'\)\.select\('\*'\)/)
})
