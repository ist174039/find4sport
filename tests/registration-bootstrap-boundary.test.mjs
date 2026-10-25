import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const professionalPage = await readFile(new URL('../app/(public)/auth/registar/profissional/page.tsx', import.meta.url), 'utf8')
const spacePage = await readFile(new URL('../app/(public)/auth/registar/espaco/page.tsx', import.meta.url), 'utf8')
const actions = await readFile(new URL('../app/actions/register.ts', import.meta.url), 'utf8')

test('provider registration pages use the server bootstrap without querying profiles or categories in the browser', () => {
  assert.match(professionalPage, /getProviderRegistrationBootstrap\('professional'\)/)
  assert.match(spacePage, /getProviderRegistrationBootstrap\('space'\)/)
  for (const page of [professionalPage, spacePage]) {
    assert.doesNotMatch(page, /\.from\(['"](?:professionals|sport_spaces|categories)['"]\)/)
    assert.doesNotMatch(page, /select\(['"]\*['"]\)/)
  }
})

test('registration bootstrap derives ownership from the authenticated server user and returns a narrow category projection', () => {
  const bootstrap = actions.slice(actions.indexOf('export async function getProviderRegistrationBootstrap'), actions.indexOf('async function validateCategoryIds'))
  assert.match(bootstrap, /requireAuthenticatedUser\(\)/)
  assert.match(bootstrap, /\.eq\('user_id', user\.id\)/)
  assert.match(bootstrap, /\.eq\('owner_user_id', user\.id\)/)
  assert.match(bootstrap, /\.limit\(1\)\.maybeSingle\(\)/)
  assert.match(bootstrap, /select\('id,name,slug,emoji,parent_id'\)/)
  assert.match(bootstrap, /\.eq\('is_active', true\)/)
  assert.match(bootstrap, /existingResult\.error/)
  assert.match(bootstrap, /if \(error\) throw new Error\('Não foi possível carregar as modalidades\.'/)
  assert.doesNotMatch(bootstrap, /_userIdFromClient|select\(['"]\*['"]\)/)
  assert.match(actions, /isAccountUnavailable\(user\)/)
  assert.match(actions, /\.eq\('id', professionalId\)\.eq\('user_id', user\.id\)/)
  assert.match(actions, /\.eq\('id', spaceId\)\.eq\('owner_user_id', user\.id\)/)
  assert.match(actions, /existingProfError/)
  assert.match(actions, /existingSpaceError/)
})

test('registration writes no longer accept client supplied identity arguments', () => {
  assert.match(actions, /registerProfessionalInitial\(\s*profPayload: ProfessionalInput/)
  assert.match(actions, /registerSpaceInitial\(spacePayload: SpaceInput/)
  assert.match(professionalPage, /registerProfessionalInitial\(\{/)
  assert.match(spacePage, /registerSpaceInitial\(\{/)
  assert.doesNotMatch(professionalPage, /registerProfessionalInitial\(formData\.email|userId/)
  assert.doesNotMatch(spacePage, /registerSpaceInitial\(userId|userId/)
  assert.match(professionalPage, /disabled=\{saving\|\|!bootstrapReady\}/)
  assert.match(spacePage, /disabled=\{saving\|\|!bootstrapReady\}/)
})
