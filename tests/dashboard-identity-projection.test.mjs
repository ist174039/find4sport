import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const layout = await readFile(new URL('../app/dashboard/layout.tsx', import.meta.url), 'utf8')
const access = await readFile(new URL('../lib/auth/access.ts', import.meta.url), 'utf8')
const dashboard = await readFile(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8')
const gallery = await readFile(new URL('../app/dashboard/galeria/page.tsx', import.meta.url), 'utf8')

test('dashboard sidebar reads owner identity server-side with narrow fields and owner filters', () => {
  assert.match(layout, /createAdminClient\(\)/)
  assert.match(layout, /ownerDb\.from\('professionals'\)\.select\('full_name,professional_name,avatar_url'\)\.eq\('user_id', user\.id\)/)
  assert.match(layout, /ownerDb\.from\('sport_spaces'\)\.select\('id,name,logo_url,created_at'\)\.eq\('owner_user_id', user\.id\)/)
  assert.doesNotMatch(layout, /supabase\.from\('(professionals|sport_spaces)'\)/)
})

test('session access checks provider ownership through the server-only client and authenticated user id', () => {
  assert.match(access, /import 'server-only'/)
  assert.match(access, /createAdminClient\(\)/)
  assert.match(access, /ownerDb\.from\('professionals'\).*\.eq\('user_id', user\.id\)/)
  assert.match(access, /ownerDb\.from\('sport_spaces'\).*\.eq\('owner_user_id', user\.id\)/)
  assert.doesNotMatch(access, /supabase\.from\('(professionals|sport_spaces)'\)/)
})

test('provider dashboard uses owner-scoped minimal projections instead of broad table rows', () => {
  assert.match(dashboard, /ownerDb\.from\('professionals'\)\.select\('id,full_name,professional_name,views_count,rating_avg,review_count'\)\.eq\('user_id',user\.id\)/)
  assert.match(dashboard, /ownerDb\.from\('sport_spaces'\)\.select\('id,name,views_count,rating_avg,review_count'\)\.eq\('owner_user_id',user\.id\)/)
  assert.doesNotMatch(dashboard, /supabase\.from\('(professionals|sport_spaces)'\)|select\('\*'\)/)
})

test('gallery private fields are fetched only in the authenticated owner dashboard with explicit projections', () => {
  assert.match(gallery, /createAdminClient\(\)/)
  assert.match(gallery, /ownerDb\.from\('professionals'\)\.select\('id,gallery_urls,private_gallery_urls,cover_url,avatar_url'\)\.eq\('user_id', user\.id\)/)
  assert.match(gallery, /ownerDb\.from\('sport_spaces'\)\.select\('id,name,gallery_urls,private_gallery_urls,cover_url,logo_url,created_at'\)\.eq\('owner_user_id', user\.id\)/)
  assert.doesNotMatch(gallery, /supabase\.from\('(professionals|sport_spaces)'\)|select\('\*'\)/)
})
