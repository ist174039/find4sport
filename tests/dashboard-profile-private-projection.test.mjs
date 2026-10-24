import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const profilePage = await readFile(new URL('../app/dashboard/perfil/page.tsx', import.meta.url), 'utf8')
const professionalStatusPage = await readFile(new URL('../app/(public)/profissional/estado/page.tsx', import.meta.url), 'utf8')

test('private professional profile read is server-only, owner-scoped and explicitly projected', () => {
  assert.match(profilePage, /const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\)/)
  assert.match(profilePage, /const access = await resolveSessionAccess\(supabase, user\)/)
  assert.match(profilePage, /if \(access\.role === 'professional'\) \{\s*const ownerDb = createAdminClient\(\)/)
  assert.match(profilePage, /ownerDb\.from\('professionals'\)\s*\.select\('id,full_name,phone,nif,avatar_url,cover_url,professional_name,service_radius_km,whatsapp,website,address,bio,public_slug,professional_categories\(category_id\)'\)\s*\.eq\('user_id', user\.id\)/)
  assert.match(profilePage, /if \(error\) throw new Error\('Não foi possível carregar o perfil profissional\.'\)/)
  assert.doesNotMatch(profilePage, /supabase\.from\('professionals'\)|ownerDb\.from\('professionals'\)\.select\('\*'/)
})

test('professional status read is server-only, owner-scoped and explicitly projected', () => {
  assert.match(professionalStatusPage, /const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\)/)
  assert.match(professionalStatusPage, /const access = await resolveSessionAccess\(supabase, user\)/)
  assert.match(professionalStatusPage, /access\?\.role !== 'professional' \|\| !access\.canManageProfessionals/)
  assert.match(professionalStatusPage, /const ownerDb = createAdminClient\(\)/)
  assert.match(professionalStatusPage, /ownerDb\.from\('professionals'\)\.select\(`\s*[\s\S]*?id,is_verified,full_name,professional_name,avatar_url,bio,email,phone,address,public_slug,[\s\S]*?professional_categories\(category:categories\(id,name\)\)\s*`\)\s*\.eq\('user_id', user\.id\)/)
  assert.match(professionalStatusPage, /if \(error\) throw new Error\('Não foi possível carregar o estado do perfil profissional\.'\)/)
  assert.doesNotMatch(professionalStatusPage, /supabase\.from\('professionals'\)|ownerDb\.from\('professionals'\)\.select\('\*'/)
})
