import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const actions = await readFile(new URL('../app/dashboard/espaco/actions.ts', import.meta.url), 'utf8')
const authorization = await readFile(new URL('../lib/auth/authorization.ts', import.meta.url), 'utf8')

test('managed-space writes reuse the shared venue-manager authorization boundary', () => {
  assert.match(actions, /requireVenueManager as requireAuthorizedVenueManager/)
  assert.match(actions, /await requireAuthorizedVenueManager\(\)/)
  assert.doesNotMatch(actions, /from\('platform_users'\)\.select\('type'\)/)
  assert.match(authorization, /export async function requireVenueManager\(\)/)
  assert.match(authorization, /session\.access\.canManageSpaces/)
})

test('managed-space update is owner scoped and returns stable errors', () => {
  const authIndex = actions.indexOf('await requireVenueManagerContext()')
  const updateIndex = actions.indexOf(".from('sport_spaces').update(patch)")
  assert.ok(authIndex >= 0 && updateIndex > authIndex)
  assert.match(actions, /\.eq\('id', spaceId\)\.eq\('owner_user_id', user\.id\)/)
  assert.match(actions, /throw new Error\('Não foi possível guardar o espaço\.'\)/)
})

test('space claim derives claimant identity from the authorized session', () => {
  const claimStart = actions.indexOf('export async function submitSpaceClaimAction')
  const claimSource = actions.slice(claimStart)
  assert.match(claimSource, /const \{ user, admin \} = await requireVenueManagerContext\(\)/)
  assert.match(claimSource, /user_id: user\.id/)
  assert.doesNotMatch(claimSource, /userId\s*:/)
})
