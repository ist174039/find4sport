import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const search = readFileSync(new URL('../components/search-bar.tsx', import.meta.url), 'utf8')
const filters = readFileSync(new URL('../components/pesquisa-filtros.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
const contract = readFileSync(new URL('../docs/HMI_MOBILE_FIRST.md', import.meta.url), 'utf8')
const dashboard = readFileSync(new URL('../components/dashboard/overview-dashboard.tsx', import.meta.url), 'utf8')
const tabs = readFileSync(new URL('../components/ui/tabs.tsx', import.meta.url), 'utf8')
const professionalCard = readFileSync(new URL('../components/professional-card.tsx', import.meta.url), 'utf8')
const spaceCard = readFileSync(new URL('../components/space-card.tsx', import.meta.url), 'utf8')
const eventCard = readFileSync(new URL('../components/event-card.tsx', import.meta.url), 'utf8')
const discoveryPagination = readFileSync(new URL('../components/patterns/discovery-pagination.tsx', import.meta.url), 'utf8')
const notificationsPage = readFileSync(new URL('../app/dashboard/notificacoes/page.tsx', import.meta.url), 'utf8')
const publicBlogPage = readFileSync(new URL('../app/(public)/blog/page.tsx', import.meta.url), 'utf8')
const publicCareersPage = readFileSync(new URL('../app/(public)/carreiras/page.tsx', import.meta.url), 'utf8')
const professionalDetailPage = readFileSync(new URL('../app/(public)/profissionais/[id]/page.tsx', import.meta.url), 'utf8')
const spaceDetailPage = readFileSync(new URL('../app/(public)/espacos/[id]/page.tsx', import.meta.url), 'utf8')
const eventDetailPage = readFileSync(new URL('../app/(public)/eventos/[id]/page.tsx', import.meta.url), 'utf8')
const joinCommunityButton = readFileSync(new URL('../components/join-community-btn.tsx', import.meta.url), 'utf8')

test('global search covers the four public entity families and has search semantics', () => {
  for (const entity of ['profissionais', 'espacos', 'eventos', 'comunidades']) assert.match(search, new RegExp(entity))
  assert.match(search, /role="search"/)
  assert.match(search, /type="submit"/)
})

test('mobile discovery exposes accessible state and minimum primary control sizing', () => {
  assert.match(filters, /aria-live="polite"/)
  assert.match(filters, /aria-pressed=/)
  assert.match(filters, /min-h-11/)
  assert.match(search, /min-h-11/)
})

test('global interaction baseline preserves visible focus and reduced motion', () => {
  assert.match(css, /:focus-visible/)
  assert.match(css, /prefers-reduced-motion:\s*reduce/)
})

test('HMI contract records mobile-first, states, PT-PT and evidence requirements', () => {
  for (const term of ['Mobile first', 'loading', 'vazio', 'erro', 'sucesso', 'disabled', 'PT-PT', 'E2E desktop e mobile']) assert.ok(contract.includes(term), term)
})


test('dashboard pilot uses semantic feedback tokens and mobile-sized primary actions', () => {
  assert.doesNotMatch(dashboard, /bg-amber-|text-amber-/)
  assert.match(dashboard, /bg-warning\/10/)
  assert.match(dashboard, /min-h-11/)
  assert.match(dashboard, /focus-visible:ring-2/)
})


test('shared tabs remain usable on narrow viewports', () => {
  assert.match(tabs, /min-h-11/)
  assert.match(tabs, /overflow-x-auto/)
  assert.match(tabs, /min-h-10/)
  assert.match(tabs, /focus-visible:ring/)
})


test('discovery cards use semantic status tokens and taxonomy labels', () => {
  for (const card of [professionalCard, spaceCard, eventCard]) {
    assert.doesNotMatch(card, /amber-500/)
    assert.doesNotMatch(card, /\.emoji}/)
    assert.match(card, /focus-visible:ring-2/)
  }
  assert.match(professionalCard, /fill-warning text-warning/)
  assert.match(spaceCard, /fill-warning text-warning/)
  assert.match(eventCard, /bg-warning/)
})


test('discovery pagination keeps mobile targets, current-page semantics and visible focus', () => {
  assert.match(discoveryPagination, /min-h-11/)
  assert.match(discoveryPagination, /min-w-11/)
  assert.match(discoveryPagination, /aria-current=/)
  assert.match(discoveryPagination, /focus-visible:ring-2/)
  assert.match(discoveryPagination, /aria-disabled=/)
})


test('notification dashboard keeps an explicit minimum-data projection', () => {
  assert.doesNotMatch(notificationsPage, /select\(['"]\*['"]\)/)
  assert.match(notificationsPage, /id,type,message,read_at,created_at,link,data/)
  assert.match(notificationsPage, /eq\('user_id',user\.id\)/)
})


test('public content surfaces avoid wildcard projections and hard-coded warning colors', () => {
  for (const page of [publicBlogPage, publicCareersPage, professionalDetailPage]) assert.doesNotMatch(page, /select\(['"]\*['"]\)/)
  assert.match(publicBlogPage, /title,description,content/)
  assert.match(publicCareersPage, /title,description,content/)
  assert.doesNotMatch(professionalDetailPage, /amber-/)
  assert.match(professionalDetailPage, /text-warning/)
})


test('entity detail warning states use semantic tokens consistently', () => {
  for (const page of [professionalDetailPage, spaceDetailPage, eventDetailPage, joinCommunityButton]) assert.doesNotMatch(page, /amber-/)
  assert.match(spaceDetailPage, /warning/)
  assert.match(eventDetailPage, /warning/)
  assert.match(joinCommunityButton, /min-h-11/)
  assert.match(joinCommunityButton, /text-warning/)
})
