import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const migration = new URL('../supabase/migrations/20261022101506_revoke_legacy_public_radius_search.sql', import.meta.url)
const discoveryMigration = new URL('../supabase/migrations/20261022101921_secure_public_discovery_allowlist.sql', import.meta.url)
const communityVisibilityMigration = new URL('../supabase/migrations/20261022102137_enforce_community_post_visibility.sql', import.meta.url)
const eventCountMigration = new URL('../supabase/migrations/20261022103139_revoke_public_event_participant_count.sql', import.meta.url)
const homePage = new URL('../app/(public)/page.tsx', import.meta.url)
const feedPage = new URL('../app/(public)/feed/page.tsx', import.meta.url)
const bookingPage = new URL('../app/(public)/reservar/[slug]/page.tsx', import.meta.url)
const bookingResolutionRoute = new URL('../app/api/public/spaces/resolve-booking/[slug]/route.ts', import.meta.url)
const publicSpaceProfile = new URL('../app/(public)/espacos/[id]/page.tsx', import.meta.url)
const stripeCheckoutRoute = new URL('../app/api/checkout_sessions/route.ts', import.meta.url)
const bookingActions = new URL('../app/actions/booking.ts', import.meta.url)
const professionalProfile = new URL('../app/(public)/profissionais/[id]/page.tsx', import.meta.url)
const spaceProfessionalActions = new URL('../app/actions/space-professionals.ts', import.meta.url)
const communityProfile = new URL('../app/(public)/comunidades/[id]/page.tsx', import.meta.url)
const followActions = new URL('../app/actions/follow.ts', import.meta.url)
const followButton = new URL('../components/follow-button.tsx', import.meta.url)
const publicFollowAction = new URL('../components/public-follow-action.tsx', import.meta.url)
const spaceActions = new URL('../components/space-actions.tsx', import.meta.url)
const packageCheckoutRoute = new URL('../app/api/package-checkout/route.ts', import.meta.url)
const discoveryPostgresHarness = new URL('../scripts/test-public-discovery-postgres.mjs', import.meta.url)

test('legacy radius search RPCs are unavailable to public Data API roles', async () => {
  const sql = (await readFile(migration, 'utf8')).toLowerCase()

  for (const name of ['search_professionals_by_radius', 'search_spaces_by_radius']) {
    assert.match(sql, new RegExp(`revoke execute on function public\\.${name}\\([^;]+from public, anon, authenticated`))
    assert.match(sql, new RegExp(`grant execute on function public\\.${name}\\([^;]+to service_role`))
  }
})

test('public discovery RPCs use explicit projections and a fixed search path', async () => {
  const sql = (await readFile(discoveryMigration, 'utf8')).toLowerCase()

  assert.equal((sql.match(/\(/g) || []).length, (sql.match(/\)/g) || []).length, 'discovery migration must have balanced parentheses')
  assert.equal((sql.match(/create or replace function public\.discover_(?:professionals|spaces)\(/g) || []).length, 2)
  assert.equal((sql.match(/security invoker set search_path=pg_catalog,public/g) || []).length, 2)
  assert.doesNotMatch(sql, /security definer/)
  assert.doesNotMatch(sql, /select\s+[ps]\.\*|to_jsonb\s*\(\s*[ps]\s*\)/)
  assert.equal((sql.match(/pu\.account_status='active' or \(pu\.account_status='suspended' and pu\.suspended_until<=now\(\)\)/g) || []).length, 2)
  assert.match(sql, /s\.owner_user_id is not null and exists \([\s\S]{0,260}pu\.id=s\.owner_user_id/)
  assert.equal((sql.match(/offset least\(greatest\(p_offset,0\),10000\) limit least\(greatest\(p_limit,1\),100\)/g) || []).length, 2)
  assert.equal((sql.match(/left\(coalesce\(p_q,''\),120\)/g) || []).length, 8)
  assert.equal((sql.match(/left\(coalesce\(p_location,''\),120\)/g) || []).length, 4)
  const projections = [...sql.matchAll(/select jsonb_build_object\(([\s\s\S]*?)\),cnt from ranked;/g)].map(match => match[1])
  assert.equal(projections.length, 2)
  for (const sensitive of ['stripe_account_id', 'private_gallery_urls', 'nif', 'owner_user_id', 'user_id', 'email']) {
    assert.equal(projections.some(projection => new RegExp(`['\"]${sensitive}['\"]`).test(projection)), false)
  }
  assert.match(sql, /grant execute on function public\.discover_professionals\([\s\s\S]+?to anon,authenticated/)
  assert.match(sql, /grant execute on function public\.discover_spaces\([\s\s\S]+?to anon,authenticated/)
})

test('community visibility is tracked by the applied forward policy migration', async () => {
  const sql = (await readFile(communityVisibilityMigration, 'utf8')).toLowerCase()
  for (const [table, policy, legacy] of [
    ['posts', 'posts_visible_by_community', 'public profiles are viewable by everyone.'],
    ['post_comments', 'post_comments_visible_by_post', 'comments are viewable by everyone'],
    ['post_likes', 'post_likes_visible_by_post', 'likes are viewable by everyone'],
  ]) {
    assert.match(sql, new RegExp(`drop policy if exists \\"${legacy}\\" on public\\.${table}`))
    assert.match(sql, new RegExp(`create policy \\"${policy}\\"[\\s\\S]+?on public\\.${table}`))
  }
  assert.equal((sql.match(/app_private\.can_view_community\(/g) || []).length, 3)
})

test('public event participant count is not executable through public API roles', async () => {
  const sql = (await readFile(eventCountMigration, 'utf8')).toLowerCase()
  assert.match(sql, /revoke execute on function public\.public_event_participant_count\(uuid\)\s+from public, anon, authenticated/)
  assert.match(sql, /grant execute on function public\.public_event_participant_count\(uuid\)\s+to service_role/)
})

test('public home counts use the RLS-protected server client', async () => {
  const source = await readFile(homePage, 'utf8')
  assert.match(source, /spacesCount=\{discoveryTotalCount\(spaceResult\)\}/)
  assert.match(source, /profsCount=\{discoveryTotalCount\(proResult\)\}/)
  assert.doesNotMatch(source, /from\('(sport_spaces|professionals)'\)\.select\('id', \{ count: 'exact', head: true \}\)/)
})

test('public feed entity reads stay server-side and explicitly filtered', async () => {
  const source = await readFile(feedPage, 'utf8')
  assert.match(source, /const admin = createAdminClient\(\)/)
  assert.doesNotMatch(source, /supabase\.from\('(sport_spaces|professionals)'\)/)
  assert.match(source, /admin\.from\('professionals'\)[\s\S]{0,200}\.eq\('status', 'active'\)/)
  assert.match(source, /admin\.from\('sport_spaces'\)[\s\S]{0,200}\.eq\('status', 'active'\)/)
  assert.match(source, /eligibleOwnerIds\(ownerIds\)/)
  assert.match(source, /eligibleOwnerIds\(postOwnerIds\)/)
  assert.match(source, /const posts = rawPosts\.filter\(/)
  assert.match(source, /isPublicAccountEligible\(owner\.account_status, owner\.suspended_until\)/)
  assert.match(source, /select\('type,full_name,avatar_url,account_status,suspended_until'\)/)
  assert.match(source, /canPublish = isPublicAccountEligible\(profile\.account_status, profile\.suspended_until\)/)
})

test('booking lookup uses a narrow server endpoint instead of direct anon table access', async () => {
  const [page, route] = await Promise.all([readFile(bookingPage, 'utf8'), readFile(bookingResolutionRoute, 'utf8')])
  assert.doesNotMatch(page, /createClient|from\('sport_spaces'\)/)
  assert.match(page, /\/api\/public\/spaces\/resolve-booking/)
  assert.match(route, /createAdminClient\(\)/)
  assert.match(route, /\^\[A-Za-z0-9\]\[A-Za-z0-9_-\]\{0,119\}\$/)
  assert.match(route, /select\('id,slug,status,owner_user_id'\)/)
  assert.match(route, /if \(!space\.owner_user_id\) return NextResponse\.json\(\{ space: null \}/)
  assert.match(route, /Public booking owner status lookup failed/)
  assert.match(route, /space: \{ id: space\.id, slug: space\.slug, status: space\.status \}/)
})

test('space profile and both reservation creation paths enforce owner eligibility', async () => {
  const [profile, checkout, actions, proProfile, associationActions, community] = await Promise.all([
    readFile(publicSpaceProfile, 'utf8'),
    readFile(stripeCheckoutRoute, 'utf8'),
    readFile(bookingActions, 'utf8'),
    readFile(professionalProfile, 'utf8'),
    readFile(spaceProfessionalActions, 'utf8'),
    readFile(communityProfile, 'utf8'),
  ])
  assert.match(profile, /isPublicAccountEligible\(owner\?\.account_status,\s*owner\?\.suspended_until\)/)
  assert.match(checkout, /isPublicAccountEligible\(owner\?\.account_status,\s*owner\?\.suspended_until\)/)
  assert.match(actions, /isPublicAccountEligible\(owner\?\.account_status,\s*owner\?\.suspended_until\)/)
  assert.match(checkout, /ownerError\|\|!isPublicAccountEligible/)
  assert.match(actions, /ownerError \|\| !isPublicAccountEligible/)
  assert.match(profile, /if \(!space\.owner_user_id\) notFound\(\)/)
  assert.match(actions, /if \(!space\.owner_user_id\) throw new Error\('O espaço ainda não foi reivindicado\.'\)/)
  assert.match(checkout, /space\.status!=='active'\|\|!space\.owner_user_id/)
  assert.match(proProfile, /eligibleAssociatedOwnerIds/)
  assert.match(proProfile, /Boolean\(space\.owner_user_id\)/)
  assert.match(associationActions, /\.not\('owner_user_id', 'is', null\)/)
  assert.match(associationActions, /isPublicAccountEligible\(owner\.account_status, owner\.suspended_until\)/)
  assert.match(community, /eligibleSpaceIds/)
  assert.match(community, /candidatePosts\.filter\(post => !post\.sport_space_id \|\| eligibleSpaceIds\.has\(post\.sport_space_id\)\)/)
})

test('professional paid, free, and package booking paths validate owner account status', async () => {
  const [checkout, actions, packageCheckout] = await Promise.all([
    readFile(stripeCheckoutRoute, 'utf8'),
    readFile(bookingActions, 'utf8'),
    readFile(packageCheckoutRoute, 'utf8'),
  ])

  const paidServicePath = checkout.slice(checkout.indexOf('if(serviceId){'), checkout.indexOf("}else{const{data:room"))
  assert.match(paidServicePath, /platform_users/)
  assert.match(paidServicePath, /isPublicProfessionalEligible\(provider\.status,owner\?\.account_status,owner\?\.suspended_until\)/)
  assert.ok(checkout.indexOf('isPublicProfessionalEligible') < checkout.indexOf("from('reservations').insert"))

  const packageReservationPath = actions.slice(actions.indexOf('export async function createPackageReservationAction'), actions.indexOf('export async function createFreeReservationAction'))
  assert.match(packageReservationPath, /await assertProfessionalOwnerEligible\(admin, service\.professional_id\)/)
  assert.ok(packageReservationPath.indexOf('assertProfessionalOwnerEligible') < packageReservationPath.indexOf("from('reservations').insert"))

  const freeReservationPath = actions.slice(actions.indexOf('export async function createFreeReservationAction'))
  assert.match(freeReservationPath, /professionalId = service\.professional_id[\s\S]{0,150}assertProfessionalOwnerEligible\(admin, professionalId\)/)
  assert.ok(freeReservationPath.indexOf('assertProfessionalOwnerEligible') < freeReservationPath.indexOf("from('reservations').insert"))

  assert.match(packageCheckout, /isPublicProfessionalEligible\(pack\.professional\.status, owner\?\.account_status, owner\?\.suspended_until\)/)
  assert.ok(packageCheckout.indexOf('isPublicProfessionalEligible') < packageCheckout.indexOf("from('service_package_purchases').insert"))
})

test('PostgreSQL harness is explicit about local destructive scope and legacy direct grants', async () => {
  const harness = await readFile(discoveryPostgresHarness, 'utf8')
  const targetGuard = await readFile(new URL('../scripts/lib/disposable-postgres-target.mjs', import.meta.url), 'utf8')
  assert.match(harness, /PUBLIC_DISCOVERY_TEST_ALLOW_DESTRUCTIVE/)
  assert.match(harness, /GRANT SELECT ON public\.professionals, public\.sport_spaces TO anon, authenticated/)
  assert.match(harness, /anon_direct_space_select: true/)
  assert.match(harness, /anon_direct_professional_tax_id_select: true/)
  assert.match(targetGuard, /ALLOWED_HOSTS/)
  assert.match(targetGuard, /non-loopback PostgreSQL host/)
})

test('public space controls resolve owner identity server-side instead of serializing owner ids', async () => {
  const [feed, profile, followServer, button, publicFollow, reserve] = await Promise.all([
    readFile(feedPage, 'utf8'),
    readFile(publicSpaceProfile, 'utf8'),
    readFile(followActions, 'utf8'),
    readFile(followButton, 'utf8'),
    readFile(publicFollowAction, 'utf8'),
    readFile(spaceActions, 'utf8'),
  ])

  assert.match(feed, /FollowButton targetSpaceId=\{space\.id\}/)
  assert.doesNotMatch(feed, /FollowButton targetUserId=\{space\.owner_user_id\}/)
  assert.match(profile, /PublicFollowAction spaceId=\{space\.id\}/)
  assert.match(profile, /ReserveSpaceBtn spaceId=\{space\.id\}/)
  assert.doesNotMatch(profile, /PublicFollowAction targetUserId=|ReserveSpaceBtn[^\n]*ownerUserId=/)
  assert.match(followServer, /toggleFollowSpaceAction\(spaceId/)
  assert.match(followServer, /select\('id,status,owner_user_id'\)/)
  assert.match(followServer, /isPublicAccountEligible\(owner\.account_status, owner\.suspended_until\)/)
  assert.match(button, /targetSpaceId\s*\?\s*await toggleFollowSpaceAction/)
  assert.match(publicFollow, /targetSpaceId=\{spaceId\}/)
  assert.doesNotMatch(reserve, /ownerUserId|InitiateConversationButton/)
})
