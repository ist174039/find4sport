import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const action = await readFile(new URL('../app/actions/follow.ts', import.meta.url), 'utf8')
const modal = await readFile(new URL('../components/follow-list-modal.tsx', import.meta.url), 'utf8')

test('social list server actions return ordered pages capped at 25 and propagate query errors', () => {
  assert.match(action, /const FOLLOW_LIST_PAGE_SIZE = 25/)
  assert.match(action, /\.order\(column, \{ ascending: true \}\)\s*\.range\(offset, offset \+ FOLLOW_LIST_PAGE_SIZE\)/)
  assert.match(action, /if \(error\) throw error/)
  assert.match(action, /if \(queryError\) throw queryError/)
  assert.match(action, /hasMore: \(rows \|\| \[\]\)\.length > FOLLOW_LIST_PAGE_SIZE/)
  assert.match(action, /getMyFollowingIds\(supabase, user\?\.id, ids\)/)
  assert.match(action, /query\.in\('following_id', candidateIds\)/)
})

test('social list modal appends pages and distinguishes empty results from query failures', () => {
  assert.match(modal, /getFollowersListPage, getFollowingListPage/)
  assert.match(modal, /if \(res\.error\)[\s\S]*setLoadError\(true\)/)
  assert.match(modal, /setItems\(current => \[\.\.\.current, \.\.\.\(result\.list \|\| \[\]\)/)
  assert.match(modal, /'Carregar mais'/)
  assert.match(modal, /role="alert"/)
})
