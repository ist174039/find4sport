import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const page = readFileSync(new URL('../app/dashboard/espaco/page.tsx', import.meta.url), 'utf8')
const actions = readFileSync(new URL('../app/dashboard/espaco/actions.ts', import.meta.url), 'utf8')
const adminClient = readFileSync(new URL('../lib/supabase/admin.ts', import.meta.url), 'utf8')

test('managed space dashboard resolves only the authenticated owner with a minimal server projection', () => {
  assert.match(page, /auth\.getUser\(\)/)
  assert.match(page, /const ownerDb = createAdminClient\(\)/)
  assert.match(page, /ownerDb[\s\S]*?from\('sport_spaces'\)[\s\S]*?select\('id,name,description,email,phone,website,address,amenities,slug,is_verified,status'\)[\s\S]*?eq\('owner_user_id', user\.id\)/)
  assert.doesNotMatch(page, /\.select\('\*'\)/)
  assert.match(adminClient, /import 'server-only'/)
})

test('managed space update keeps the owner predicate and returns only fields consumed by the UI', () => {
  assert.match(actions, /update\(patch\)[\s\S]*?eq\('id', spaceId\)[\s\S]*?eq\('owner_user_id', user\.id\)[\s\S]*?select\('id,name,description,email,phone,website,address,amenities,slug,is_verified,status'\)/)
  assert.doesNotMatch(actions, /update\(patch\)[\s\S]{0,180}\.select\('\*'\)/)
})
