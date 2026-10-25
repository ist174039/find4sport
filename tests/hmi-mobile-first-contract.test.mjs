import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const search = readFileSync(new URL('../components/search-bar.tsx', import.meta.url), 'utf8')
const filters = readFileSync(new URL('../components/pesquisa-filtros.tsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
const contract = readFileSync(new URL('../docs/HMI_MOBILE_FIRST.md', import.meta.url), 'utf8')
const dashboard = readFileSync(new URL('../components/dashboard/overview-dashboard.tsx', import.meta.url), 'utf8')
const tabs = readFileSync(new URL('../components/ui/tabs.tsx', import.meta.url), 'utf8')
const publicHome = readFileSync(new URL('../app/(public)/page.tsx', import.meta.url), 'utf8')
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
const discoveryFilterModal = readFileSync(new URL('../components/filter-modal.tsx', import.meta.url), 'utf8')
const feedFilterModal = readFileSync(new URL('../components/feed-filter-modal.tsx', import.meta.url), 'utf8')
const postCard = readFileSync(new URL('../components/post-card.tsx', import.meta.url), 'utf8')
const reviewsSection = readFileSync(new URL('../components/reviews-section.tsx', import.meta.url), 'utf8')
const dashboardSidebar = readFileSync(new URL('../components/dashboard/sidebar.tsx', import.meta.url), 'utf8')
const adminSidebar = readFileSync(new URL('../components/admin/sidebar.tsx', import.meta.url), 'utf8')
const searchResultsList = readFileSync(new URL('../components/search-results-list.tsx', import.meta.url), 'utf8')
const billingDashboard = readFileSync(new URL('../app/dashboard/faturacao/page.tsx', import.meta.url), 'utf8')
const communityFeedAction = readFileSync(new URL('../app/actions/community-feed.ts', import.meta.url), 'utf8')
const eventCreatePage = readFileSync(new URL('../app/dashboard/eventos/criar/page.tsx', import.meta.url), 'utf8')
const billingActions = readFileSync(new URL('../app/dashboard/faturacao/actions.ts', import.meta.url), 'utf8')

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


test('filters and feed interactions keep touch targets, focus containment and semantic status tokens', () => {
  assert.match(discoveryFilterModal, /min-h-11/)
  assert.doesNotMatch(discoveryFilterModal, /h-9 w-9|text-\[10px\]/)
  assert.match(discoveryFilterModal, /role="dialog"/)
  assert.match(discoveryFilterModal, /aria-modal="true"/)
  assert.match(discoveryFilterModal, /dialogRef/)
  assert.match(discoveryFilterModal, /event\.key !== 'Tab'/)
  assert.match(discoveryFilterModal, /triggerRef\.current\?\.focus\(\)/)
  assert.match(feedFilterModal, /min-h-11/)
  assert.doesNotMatch(feedFilterModal, /amber-|blue-500/)
  assert.match(feedFilterModal, /text-warning/)
  assert.doesNotMatch(postCard, /h-8 w-8|h-9 w-9|text-\[10px\]/)
  assert.match(postCard, /h-11 w-11/)
  assert.match(postCard, /size-11/)
  assert.match(postCard, /min-h-11 shrink-0 items-center/)
})


test('review rating controls use semantic tokens and mobile touch targets', () => {
  assert.doesNotMatch(reviewsSection, /amber-/)
  assert.match(reviewsSection, /h-11 w-11/)
  assert.match(reviewsSection, /focus-visible:ring-2/)
  assert.match(reviewsSection, /text-warning/)
})


test('event cards avoid sub-12px metadata on mobile', () => {
  assert.doesNotMatch(eventCard, /text-\[(?:9|10)px\]/)
  assert.match(eventCard, /text-xs/)
})


test('dashboard and admin mobile navigation avoid microtype and undersized selectors', () => {
  for (const sidebar of [dashboardSidebar, adminSidebar]) assert.doesNotMatch(sidebar, /text-\[10px\]/)
  assert.doesNotMatch(dashboardSidebar, /min-h-10 w-full rounded-xl border/)
  assert.match(dashboardSidebar, /min-h-11 w-full rounded-xl border/)
  assert.doesNotMatch(dashboardSidebar, /text-white/)
  assert.doesNotMatch(adminSidebar, /text-white/)
})


test('discovery cards and search list avoid microtype and hard-coded rating colors', () => {
  for (const surface of [professionalCard, spaceCard, eventCard, searchResultsList]) assert.doesNotMatch(surface, /text-\[(?:9|10)px\]/)
  assert.doesNotMatch(searchResultsList, /amber-/)
  assert.match(searchResultsList, /text-warning/)
})


test('billing dashboard keeps sensitive reads behind an authenticated server boundary', () => {
  assert.doesNotMatch(billingDashboard, /createClient|\.from\(/)
  assert.match(billingDashboard, /getBillingDashboardData/)
  assert.match(billingActions, /'use server'/)
  assert.match(billingActions, /auth\.getUser\(\)/)
  assert.doesNotMatch(billingActions, /select\(['"]\*['"]\)/)
  assert.match(billingActions, /tier,status,plan_id,current_period_end,cancel_at_period_end/)
  assert.doesNotMatch(billingActions, /stripe_customer_id|stripe_charge_id|stripe_connected_account_id|financial_metadata|application_fee_amount|customer_fee_rate/)
  assert.doesNotMatch(billingDashboard, /stripe_connected_account_id|financial_metadata/)
  assert.match(billingActions, /id,user_id,provider_user_id,amount,currency,type,status,created_at/)
  assert.match(billingActions, /eq\('owner_user_id', user\.id\)/)
})


test('community posting and event taxonomy readers use minimum projections', () => {
  assert.doesNotMatch(communityFeedAction, /from\('communities'\)\.select\(['"]\*['"]\)/)
  assert.match(communityFeedAction, /select\('id,posting_policy'\)/)
  assert.doesNotMatch(eventCreatePage, /from\('categories'\)\.select\(['"]\*['"]\)/)
  assert.match(eventCreatePage, /select\('id,name,slug,emoji,parent_id'\)/)
})


test('public home discovery avoids microtype and hard-coded status colors', () => {
  assert.doesNotMatch(publicHome, /text-\[(?:9|10|11)px\]/)
  assert.doesNotMatch(publicHome, /amber-|emerald-/)
  assert.match(publicHome, /fill-warning text-warning/)
})
