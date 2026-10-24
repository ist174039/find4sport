import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const page = readFileSync(new URL('../app/dashboard/espacos/salas/page.tsx', import.meta.url), 'utf8')
const adminClient = readFileSync(new URL('../lib/supabase/admin.ts', import.meta.url), 'utf8')

test('space room dashboard resolves an owned space before reading its minimal room projection', () => {
  assert.match(page, /auth\.getUser\(\)/)
  assert.match(page, /if \(!user\) redirect/)
  assert.match(page, /const ownerDb = createAdminClient\(\)/)
  assert.match(page, /ownerDb[\s\S]*?from\('sport_spaces'\)[\s\S]*?select\('id,name,slug,address'\)[\s\S]*?eq\('owner_user_id', user\.id\)/)
  assert.match(page, /ownerDb[\s\S]*?from\('space_rooms'\)[\s\S]*?select\('id,space_id,name,description,capacity,price_per_hour,is_active,gallery_urls'\)[\s\S]*?eq\('space_id', selectedSpace\.id\)/)
  assert.doesNotMatch(page, /supabase\.from\('(sport_spaces|space_rooms)'\)/)
  assert.doesNotMatch(page, /\.select\('\*'\)/)
  assert.match(adminClient, /import 'server-only'/)
})
