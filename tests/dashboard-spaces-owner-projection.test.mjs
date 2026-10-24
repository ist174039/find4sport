import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const page = readFileSync(new URL('../app/dashboard/espacos/page.tsx', import.meta.url), 'utf8')
const adminClient = readFileSync(new URL('../lib/supabase/admin.ts', import.meta.url), 'utf8')

test('space associations read profile tables server-side only after resolving the authenticated user', () => {
  assert.match(page, /auth\.getUser\(\)/)
  assert.match(page, /if \(!user\) redirect/)
  assert.match(page, /const ownerDb = createAdminClient\(\)/)
  assert.match(page, /ownerDb[\s\S]*?from\('sport_spaces'\)[\s\S]*?select\('id,name,address,slug'\)[\s\S]*?eq\('owner_user_id', user\.id\)/)
  assert.match(page, /ownerDb[\s\S]*?from\('professionals'\)[\s\S]*?select\('id'\)[\s\S]*?eq\('user_id', user\.id\)/)
  assert.match(page, /ownerDb[\s\S]*?from\('space_professionals'\)[\s\S]*?select\('space_id'\)[\s\S]*?eq\('professional_id', professional\.id\)[\s\S]*?eq\('status', 'active'\)/)
  assert.match(page, /ownerDb[\s\S]*?from\('sport_spaces'\)[\s\S]*?select\('id,name,address,slug'\)[\s\S]*?\.in\('id', associatedIds\)/)
  assert.doesNotMatch(page, /supabase\.from\('(sport_spaces|professionals|space_professionals)'\)/)
  assert.doesNotMatch(page, /\.select\('\*'\)/)
  assert.match(adminClient, /import 'server-only'/)
})
