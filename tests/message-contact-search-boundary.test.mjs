import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const modal = await readFile(new URL('../components/new-conversation-modal.tsx', import.meta.url), 'utf8')
const actions = await readFile(new URL('../app/actions/messages.ts', import.meta.url), 'utf8')

test('conversation contact search crosses the server action boundary instead of reading provider tables in the browser', () => {
  assert.match(modal, /searchConversationContacts\(trimmedQuery\)/)
  assert.doesNotMatch(modal, /createClient|\.from\(['"](?:platform_users|professionals|sport_spaces)['"]\)/)
})

test('server search authenticates, bounds and escapes input, filters eligibility, and returns a minimal contact DTO', () => {
  const action = actions.slice(actions.indexOf('export async function searchConversationContacts'), actions.indexOf('async function resolveExactContext'))
  assert.match(action, /supabase\.auth\.getUser\(\)/)
  assert.match(action, /query\.length < 2 \|\| query\.length > 80/)
  assert.match(action, /escapeLikeQuery/)
  assert.match(action, /isPublicAccountEligible/)
  assert.match(action, /isPublicProfessionalEligible/)
  assert.match(action, /\.eq\('status', 'active'\)\.eq\('is_verified', true\)/)
  assert.match(action, /\.not\('owner_user_id', 'is', null\)/)
  assert.match(action, /\.slice\(0, 15\)/)
  assert.doesNotMatch(action, /select\(['"]\*['"]\)|email|stripe_account_id|private_gallery_urls/)
})

test('search UI copy preserves the independent reservation or paid-event send authorization rule', () => {
  assert.match(modal, /envio de mensagens requer uma reserva ativa ou participação paga num evento ativo/)
  assert.match(actions, /if\(!context\.allowed\)throw new Error\(/)
})
