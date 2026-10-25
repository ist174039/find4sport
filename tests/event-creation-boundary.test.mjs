import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const legacyRoute = await readFile(new URL('../app/(public)/criar-evento/page.tsx', import.meta.url), 'utf8')
const createAction = await readFile(new URL('../app/actions/event-management.ts', import.meta.url), 'utf8')

test('legacy event creation URL redirects into the role-checked dashboard flow', () => {
  assert.match(legacyRoute, /redirect\('\/dashboard\/eventos\/criar'\)/)
  assert.doesNotMatch(legacyRoute, /createClient|\.from\(['"]events['"]\)|storage\.from\(['"]events['"]\)/)
})

test('event creation validates session, role, entitlement, paid-event configuration, and category server-side', () => {
  const action = createAction.slice(createAction.indexOf('export async function createEventAction'), createAction.indexOf('export async function updateEventAction'))
  assert.match(action, /supabase\.auth\.getUser\(\)/)
  assert.match(action, /resolveSessionAccess\(supabase, user\)/)
  assert.match(action, /\['professional', 'venue_manager', 'event_manager'\]\.includes\(access\.role\)/)
  assert.match(action, /requireFeature\(user\.id, 'events\.create\.enabled'\)/)
  assert.match(action, /paidEventsEnabled\(configData\?\.settings\)/)
  assert.match(action, /await validateCategory\(admin, fields\.categoryId\)/)
  assert.match(action, /admin\.from\('events'\)\.insert\(payload\)/)
  assert.doesNotMatch(action, /created_by:\s*formData\.get/)
})
