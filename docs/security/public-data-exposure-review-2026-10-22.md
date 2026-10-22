# Public data exposure review — 2026-10-22

## Decision status

**Blocked for external-user validation.** Readiness remains an operational estimate of 35/100, not an audit score. This review is based on read-only catalog queries and source inspection. No production records were read, and no evidence of exploitation was collected.

## Confirmed Supabase state

- `anon` has table-level `SELECT` on `public.professionals` and `public.sport_spaces`; catalog checks also confirmed `SELECT` on every column.
- Both tables have RLS enabled. Their public policies allow active rows, so RLS does not protect private columns within an active row.
- The executable historical migration `20260816_zz_public_discovery.sql` defines `discover_professionals` and `discover_spaces` as `SECURITY DEFINER` and serializes complete table rows using `p.*` / `s.*`. The more restricted SQL in `supabase/reconciliation-proposals/20260826042410_secure_public_discovery_contracts.sql` is an archived proposal, not executable history, and must not be replayed.
- A forward migration, `20261022003244_secure_public_discovery_allowlist.sql`, is now drafted locally. It keeps the RPCs `SECURITY DEFINER` because direct table SELECT grants remain broad, but uses explicit JSON fields, omits owner identifiers and sensitive columns, and sets a fixed `search_path`. It is not applied or integration-tested; treat the current remote RPC contract as exposed until verified otherwise.
- `search_professionals_by_radius` and `search_spaces_by_radius` are `SECURITY INVOKER`, return the full table row, use `SELECT *`, and have `EXECUTE` granted to `PUBLIC`, `anon`, and `authenticated`.
- A repository search found no application call to either legacy radius RPC. This is not proof that external consumers do not use them.

## Impact and affected application flows

Sensitive direct table access can be attempted through the Supabase Data API independently of the discovery RPCs. A fix must preserve legitimate owner-only reads while closing access to other users' private columns.

Application readers identified during source review include:

- Public home counts and public feed reads of professionals/spaces.
- Public reservation availability and client-side checks that currently read `stripe_account_id`.
- Owner dashboard/profile/registration flows using broad selects, including `select('*')`.
- Follow and new-conversation flows that use entity owner IDs.
- Server-side checkout, administration, messaging, and moderation paths using the admin client.
- Public profile routes that already use explicit server-side projections.

Remediation progress: public home entity totals now derive from `total_count` returned by the discovery RPCs, so the counters share the public owner eligibility contract. Feed entity lookups use the server-only admin client with explicit filters and verify owner account eligibility before rendering entity suggestions, followed entities, and professional/space posts. The signed-in owner's account eligibility is also checked before enabling feed publication. The feed still sends owner IDs to the authenticated FollowButton flow; treat these as an unresolved minimization review. Space profile pages now check the owner state before rendering. The booking slug resolver calls a narrow server endpoint that returns only `id`, `slug`, and `status`, and checks owner account state. Both paid checkout (`/api/checkout_sessions`) and free reservation server actions independently check owner state before creating a reservation; errors fail closed. Pure eligibility tests cover active, blocked, suspended, and expired-suspension states. Other direct entity reads remain in account registration/status, conversation search, follow enrichment, and owner dashboards; they must be migrated or proven owner-scoped before table SELECT grants can be reduced.

## Required remediation

1. Revoke `EXECUTE` on both legacy radius RPCs from `PUBLIC`, `anon`, and `authenticated`, unless an external dependency is found and migrated. A local migration `20261022002606_revoke_legacy_public_radius_search.sql` is drafted, not applied.
2. Define and document an explicit public field allowlist. Preserve phone/WhatsApp only when deliberately published; exclude email from the public space page per the recorded product request. Never expose NIF, Stripe account IDs, private gallery URLs, or private owner identifiers.
3. Restrict direct table grants and row policies by role. Authenticated owner access must continue to work without granting authenticated users access to other active users' private columns.
4. Move public discovery and related directory/feed lookups behind a tightly scoped public contract; do not rely on `SELECT *` or broad service-role output.
5. Replace client reads of Stripe account IDs with a server endpoint that returns only a boolean booking/payment capability. The affected professional and space UI paths now use local server endpoints; this still needs integration and E2E coverage.
6. Add negative integration tests for anonymous and non-owner authenticated access, plus regression tests for discovery, feed, profile, onboarding, dashboard, and booking.
7. Apply only as a reviewed migration on an isolated/staging database, verify privileges and API responses, then run CI and authenticated desktop/mobile E2E on the same SHA.

The drafted discovery migration reproduces the restrictive account-state predicate for professional owners and excludes spaces whose owners are blocked or currently suspended. The product owner confirmed on 2026-10-22 that these spaces should remain hidden until reactivation, and that active spaces without an owner remain hidden until claimed. The migration requires `owner_user_id IS NOT NULL`, caps pagination offset at 10,000 and truncates query/location parameters to 120 characters. Static review caught and corrected an extra closing parenthesis in `discover_spaces`; a balanced-parenthesis assertion now guards the text. This does not replace a Postgres parser/execution test. Code-level feed, profile and booking checks apply the same policy. These safeguards remain local; execute them against Postgres before use.

## Follow-up review — booking bypass and direct-read inventory

Independent review found that professional status was enforced for profile/discovery but not consistently in all booking entry points. The paid service checkout, free service reservation, package checkout, and package-session reservation now resolve the professional owner and fail closed unless the profile is active and the owner account is eligible. These checks happen before reservation/package writes or Stripe checkout creation. Unit and static tests cover the predicate and guard placement; there is still no live Supabase or mocked Stripe route integration test.

The read audit found 24 session-client reads of `professionals` and `sport_spaces` across 15 files. Several are owner dashboards or server-rendered owner flows; `components/new-conversation-modal.tsx` performs browser-side identity searches without active/verified filters. A broad authenticated `SELECT` revoke would break existing consumers. Do not revoke these grants until the callsites are inventoried, moved behind authenticated narrow server interfaces, and tested. Public `anon` access to sensitive columns remains an open exposure.

The PostgreSQL harness itself now refuses remote hosts, requires an explicit destructive-test opt-in, and cleans up roles it creates. Its synthetic baseline grants `SELECT` to `anon` and `authenticated` and asserts sensitive-column access remains, making clear the current two migrations do not remediate direct table grants. This is evidence of the gap in a synthetic contract, not proof of current remote permissions.

The review also found that generic user follows accept a target user ID without checking account eligibility, and follower/following enrichment does not filter restricted account owners. Track this separately; public follow behavior needs an explicit requirement before broadening the guard to every account type.

## Conversation recipient search — local implementation

`components/new-conversation-modal.tsx` now calls the authenticated `searchConversationContacts` server action instead of querying `platform_users`, `professionals`, and `sport_spaces` in the browser. The action derives the viewer with `auth.getUser()`, fails closed on query errors, filters eligible accounts and active verified provider profiles/spaces, excludes self and unclaimed spaces, bounds and escapes input, and returns a minimal identity DTO. The UI now states the separate active reservation/paid event requirement; `sendMessage` keeps its independent context authorization. Static boundary tests, 79 repository tests, TypeScript, and targeted ESLint passed. This does not close broad table grants, test the action against a live Supabase project, or authorize a first-contact message without an active context.

## Dashboard identity minimization — 2026-10-22

The authenticated dashboard layout previously selected the full professional row to render three sidebar values. It now selects only `full_name`, `professional_name`, and `avatar_url`, scoped to the authenticated session user's `user_id`. A static regression test guards both the projection and ownership predicate. This reduces server-rendered overfetch for this one consumer; it does not change the underlying `anon`/`authenticated` grants, prove PostgREST isolation, or reduce the remaining direct-read inventory. The existing grants finding remains open and release readiness remains NO-GO.

## Evidence and limitations

Catalog evidence: table/column privileges, RLS policies, RPC ACLs, security modes, and function definitions were queried read-only in Supabase. Source evidence initially inspected at `dcbf3c0538b651c43f23ee73e990a0280fe5c2d1`; follow-up source review on 2026-10-22 corrected the discovery-function finding above and drafted two forward migrations. Neither migration was applied, production was not changed, and user data values were not retrieved. Supabase CLI authentication/configuration is unavailable in this workspace.

## Planned test cases

See Notion page **10 — QA e Plano de Testes**, cases `SEC-PUB-01` through `SEC-PUB-06`. They remain planned until executed and linked to an immutable CI run.
### Transactional professional booking eligibility — proposal only

The application-level professional owner checks now cover paid service checkout, package checkout, package-session booking, and free booking. A concurrency review found a time-of-check/time-of-use window before the reservation INSERT. `supabase/migration-proposals/20261022_enforce_professional_booking_eligibility.sql` proposes a `SECURITY DEFINER` trigger with a fixed search path and `FOR SHARE` locks on the professional and owner rows. A local PostgreSQL 17 disposable harness passed both reservation-first and moderation-first lock orderings and rejects ineligible profiles/accounts.

CI run 39707978757 passed the disposable PostgreSQL 17 test for both lock orders. The proposal is not in `supabase/migrations/` and has not been tested on a Supabase schema or applied remotely. The function owner's real RLS bypass and trigger interaction still require isolated Supabase validation. The product treatment of a pending Stripe checkout when moderation occurs after reservation commit remains unresolved. Existing direct SELECT grants and 24 authenticated table consumers are unchanged.
