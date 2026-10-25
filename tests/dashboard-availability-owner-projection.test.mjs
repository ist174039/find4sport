import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const availabilityPage = await readFile(new URL('../app/dashboard/agenda/disponibilidade/page.tsx', import.meta.url), 'utf8')

test('availability owner lookup is server-only, role-gated and scoped to the authenticated user', () => {
  assert.match(availabilityPage, /const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\)/)
  assert.match(availabilityPage, /const access = await resolveSessionAccess\(supabase, user\)/)
  assert.match(availabilityPage, /access\.role !== 'professional' \|\| !access\.canManageProfessionals/)
  assert.match(availabilityPage, /const ownerDb = createAdminClient\(\)/)
  assert.match(availabilityPage, /ownerDb\s*\.from\('professionals'\)\s*\.select\('id'\)\s*\.eq\('user_id', user\.id\)\s*\.maybeSingle\(\)/)
  assert.match(availabilityPage, /if \(professionalError\) throw new Error\('Não foi possível carregar o perfil profissional\.'\)/)
  assert.doesNotMatch(availabilityPage, /supabase\.from\('professionals'\)|ownerDb\.from\('professionals'\)\.select\('\*'/)
})
