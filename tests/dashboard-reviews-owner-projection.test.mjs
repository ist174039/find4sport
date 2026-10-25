import { readFileSync } from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source = readFileSync('app/dashboard/avaliacoes/page.tsx', 'utf8')

test('reviews owner lookup is server scoped and review rows remain session/RLS scoped', () => {
  assert.match(source, /supabase\.auth\.getUser\(\)/)
  assert.match(source, /resolveSessionAccess\(supabase,\s*user\)/)
  assert.match(source, /\['professional',\s*'venue_manager'\]/)
  assert.match(source, /const ownerDb\s*=\s*createAdminClient\(\)/)
  assert.match(source, /ownerDb\.from\('professionals'\)\.select\('id'\)\.eq\('user_id',\s*user\.id\)/)
  assert.match(source, /ownerDb\.from\('sport_spaces'\)\.select\('id,name'\)\.eq\('owner_user_id',\s*user\.id\)/)
  assert.match(source, /if\s*\(professionalError\)\s*throw new Error/)
  assert.match(source, /if\s*\(spacesError\)\s*throw new Error/)
  assert.match(source, /supabase\.from\('reviews'\)/)
  assert.match(source, /query\.eq\('rating',\s*Number\(rating\)\)/)
  assert.match(source, /query\.lte\('rating',\s*2\)/)
  assert.match(source, /query\.gte\('rating',\s*4\)/)
  assert.match(source, /query\.order\('created_at',\s*\{ascending:false\}\)\.range\(from,from\+PAGE_SIZE-1\)/)
  assert.doesNotMatch(source, /ownerDb\.from\('reviews'\)/)
})
