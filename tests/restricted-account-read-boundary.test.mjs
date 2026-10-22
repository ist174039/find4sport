import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const page = await readFile(new URL('../app/(public)/conta/restrita/page.tsx', import.meta.url), 'utf8')

test('restricted account data is read server-side with the authenticated identity and a narrow projection', () => {
  assert.match(page, /supabase\.auth\.getUser\(\)/)
  assert.match(page, /if \(!user\) redirect\('\/auth\/login\?redirect=\/conta\/restrita'\)/)
  assert.match(page, /const admin = createAdminClient\(\)/)
  assert.match(page, /admin\.from\('platform_users'\)\.select\('full_name,account_status,moderation_reason,suspended_until'\)\.eq\('id', user\.id\)/)
  assert.doesNotMatch(page, /supabase\.from\('platform_users'\)/)
  assert.doesNotMatch(page, /select\(['"]\*['"]\)/)
})

test('query failures fail closed before restricted account details are rendered', () => {
  assert.match(page, /if \(error\) redirect\('\/dashboard'\)/)
  assert.match(page, /if \(!active\) redirect\('\/dashboard'\)/)
})
