# FIND4SPORT — Production Readiness Gate

A release is eligible for production only when all of the following are true:

- GitHub Actions `Quality` passes on the exact commit being released.
- The Vercel production deployment points to that exact commit SHA and is `READY`.
- Supabase migrations for that commit are already applied and schema invariants pass.
- No P0/P1 runtime errors are observed after smoke tests.
- Smoke tests cover public discovery, authentication, reservation checkout, Stripe Connect, webhook persistence, chat realtime, notifications realtime, cancellation/change/refund, mobile navigation, and Admin operational views.
- Security Advisor has no unresolved application-owned high-risk findings.
- Gallery images upload directly from the browser to Supabase Storage; Server Actions receive storage paths only and must not proxy multi-megabyte image bodies.
- Public entities and bookable marketplace entities are distinct states: paid bookings require a valid provider lifecycle and Stripe Connect configuration.

## Release candidate

This marker follows the production-hardening changes for realtime chat and notifications, marketplace provider integrity, event tickets, scalable discovery, reservation changes, financial reconciliation, direct-to-storage gallery uploads, and public-vs-bookable entity rules.

Do not classify a release as production-ready when CI is green but Vercel is serving an older commit.

## Current gate findings

Repository checks run during the Find4Sport operations review on 2026-10-18 found the following release blockers. Current local validation: lint has 0 errors and 375 warnings (mostly explicit-any, with the 31 raw image elements migrated to `AppImage`), TypeScript passed, 36 unit tests passed, production build passed, and public E2E passed 15/15 desktop plus 15/15 mobile against the custom production domain. These local checks are not evidence for authenticated production flows.

- `npm audit --omit=dev --audit-level=low` now passes with 0 production dependency findings after updating Next.js and `eslint-config-next` to 16.4.2 and removing the unused `shadcn` CLI. The complete `npm audit` still reports 5 high advisories in the development-only ESLint dependency tree (`braces`, `micromatch`, `fast-glob`, `@next/eslint-plugin-next`, `eslint-config-next`). npm's proposed fix downgrades `eslint-config-next` to 14.2.35 (major and incompatible with Next 16); no compatible patched upstream version was available during this review. Reassess when upstream publishes a compatible fix.
- `node scripts/check-migrations.mjs` remains blocked by two prior baseline entries without a matching remote history row: `20260826034331_harden_private_community_post_visibility` and `20260826042410_secure_public_discovery_contracts`. The 23 post-cutoff rows in the read-only snapshot now have exact version/name/SQL files and checksums; seven divergent local proposals are archived outside the executable migration folder. The exact unresolved evidence and safe resolution path are recorded in `docs/migration-reconciliation-2026-10-21.md`. No production SQL or history change was made.
- Authenticated production E2E still requires ATHLETE, PROFESSIONAL, VENUE_MANAGER and ADMIN credentials. Public desktop/mobile smoke runs before this guard and now passes locally against the custom domain; authenticated role coverage remains blocked until secrets/accounts exist.
- Supabase advisor findings: leaked-password protection is disabled; a documented aggregate SECURITY DEFINER RPC is executable by anon/authenticated and needs an explicit owner risk decision; 10 policy groups require semantic review. Vercel reports production READY on SHA `d38f4c1…` with the custom alias but project field `live=false`; confirm lifecycle state with owner. Stripe requires reauthentication. The plan exposes only a 1h runtime log window; 30m query showed no errors, which does not prove uptime. Privacy and recovery exercises need accountable owners.

## Correction batch — 2026-10-21, pending CI verification

Local validation of the correction branch passed TypeScript, 56 tests and the production build. Lint reports 0 errors and 358 warnings, down from 372 before this batch; its warning ceiling is now 358 to prevent regression. The complete dependency audit reports 0 vulnerabilities after applying the explicitly maintained local nesting-depth patch described in `tooling/braces-depth-guard/README.md`. This is not an upstream release; it retains license/provenance and six attack/compatibility regression tests. Replace it with an upstream fix when one is available and verified.

These findings keep the release gate **blocked** until the migration gate passes and production evidence is attached for the same release commit. A clean local dependency audit does not establish remote CI or full security compliance.

The repository integrity gate now explicitly tracks two unapplied forward migrations and two historical entries without remote history rows. A read-only review of the authorized Supabase project (`bqjwsllnhvnxrfojftjb`) found 81 remote migration records; exact SQL for all 23 post-cutoff records is stored and checksum-verified. `node scripts/check-migrations.mjs` checks repository integrity; `node scripts/check-migrations.mjs --release` remains blocked until the two forward migrations are applied and the two historical entries have sufficient provenance. Do not infer historical provenance from current catalog state or alter remote history outside Supabase's supported repair process.

## Security remediation update — 2026-10-22

Follow-up source inspection corrected the earlier discovery-function note: executable historical `20260816_zz_public_discovery.sql` uses `SECURITY DEFINER` and serializes full professional/space rows (`p.*` / `s.*`). The restricted SQL in the archived reconciliation proposal is not executable provenance. Two forward migrations are drafted locally: `20261022002606_revoke_legacy_public_radius_search.sql` and `20261022003244_secure_public_discovery_allowlist.sql`. The latter uses explicit JSON fields and a fixed `search_path`; it remains unapplied and untested against Postgres.

Professional and space client components no longer receive Stripe Connect account IDs; server endpoints return boolean capability only. Local verification on this worktree: 60 tests, typecheck and production build pass; `git diff --check` passes. The migration gate reports four pending items: the two local migrations are not registered, and two historical reconciliations remain unresolved. There are 45 legacy filename warnings. Direct anon SELECT on both entity tables remains unresolved. No Supabase application, CI run for this worktree, merge or deployment occurred. Readiness remains **35/100**, release **NO-GO**.

Historical note (superseded 2026-10-22): an intermediate patch moved home counts to admin table queries. Current implementation derives professional/space totals from the same `discover_*` RPC results that populate the public cards, so counters follow the public eligibility contract without direct table count queries.

The public feed's professional/space entity lookups have also moved to the server-only admin client with active/verified filters. The discovery migration now mirrors account-state restrictions for professional owners and suppresses spaces whose owners are blocked or suspended, and clamps pagination offset to 10,000. Updated local verification: focused exposure tests 4/4, full suite 62/62, typecheck, targeted ESLint and production build pass. Migration gate remains at four blockers; no database integration has been run.

The booking resolver was moved to a narrow server endpoint with slug validation, private/no-store response, owner-state check and fail-closed query errors. The product owner confirmed on 2026-10-22 that spaces of blocked/suspended owners must stay hidden until reactivation. Current local verification is 5/5 focused exposure tests and 63/63 full tests, with typecheck, targeted ESLint and build passing. This rule still needs integration verification.

### Follow-up — direct access and reservation-side enforcement — 2026-10-22

Specialist review found that a known space slug still rendered the public profile and the authenticated `/api/checkout_sessions` route could create a paid booking without the slug resolver. The public profile, paid checkout route, and free reservation Server Action now independently validate owner status before showing the profile or performing reservation/Stripe side effects. A shared `isPublicAccountEligible` helper has unit tests for active, blocked, suspended, and expired suspension states. The discovery SQL proposal now bounds text/location filters to 120 characters.

Latest pre-clarification verification: 9/9 focused tests, 67/67 full tests, TypeScript, focused ESLint, Next production build and `git diff --check` passed. These checks remain local/static; PostgreSQL ACL/integration tests, CI on an immutable SHA, and E2E have not run. Direct `anon`/`authenticated` SELECT grants remain unresolved pending migration of other readers. Readiness stays **35/100 — NO-GO**.

Product clarification received after that note: active spaces with no `owner_user_id` must also remain hidden and unreservable until claimed. Discovery SQL, profile, resolver, paid checkout and free reservation guards now reject ownerless spaces.

### Follow-up — feed eligibility, home totals and SQL review — 2026-10-22

Read-only specialist review found two further owner-state paths: feed publication eligibility for the signed-in owner, and home totals that counted entity rows without applying the discovery owner predicate. The feed now checks the signed-in user's account status before enabling `canPublish`; home totals are derived from `total_count` in the discovery RPC responses. The reviewer also found an extra closing parenthesis in `discover_spaces`; it was removed and a static balanced-parenthesis assertion was added. This is a syntax regression check, not a PostgreSQL parser or execution test.

Current local verification after this follow-up: full test suite 67/67 passed; focused public exposure + eligibility tests 9/9 passed; TypeScript passed; production build passed before the final type cleanup; targeted ESLint reported four pre-existing explicit-`any` warnings in the professional packages route, which were then replaced with narrow types and the shared eligibility helper. Rerun typecheck, ESLint, full tests and build on the final worktree. Migration gate remains blocked by four items (two unregistered local migrations and two historical reconciliations), with 45 legacy warnings. No isolated Postgres/ACL, remote Supabase, immutable CI SHA, authenticated E2E, merge or deployment evidence exists. Readiness remains **35/100 — NO-GO**.

Final local verification after the feed/home eligibility changes and removal of explicit `any`: `npm test` 67/67, focused public/eligibility tests 9/9, `npm run typecheck`, targeted ESLint (0 warnings), `npm run build`, and `git diff --check` all pass. The SQL check is only a static delimiter-balance assertion; PostgreSQL parse and execution remain outstanding. Migration gate still fails on four items, with 45 legacy filename warnings. Worktree is modified and no immutable CI SHA, Supabase integration, authenticated E2E, merge, or deployment evidence exists.

## Follow-up — public owner ID minimization (2026-10-22)

The public feed now passes `spaceId` to `FollowButton`; the space profile passes only `spaceId`, authentication/ownership booleans and follow state to the client; `ReserveSpaceBtn` no longer receives `ownerUserId`. New `toggleFollowSpaceAction` authenticates the viewer, resolves the active space and owner server-side, rechecks owner eligibility, then mutates follows using the viewer session. This keeps owner identifiers inside server-side reads for these controls.

Regression coverage now asserts those client contracts and server eligibility. Final local checks for this change: `npm test` 68/68, focused public tests 10/10, typecheck, Next production build, and `git diff --check` passed. Targeted ESLint had 0 errors and 11 existing `any` warnings in `app/actions/follow.ts`. This is still a modified worktree without a final immutable SHA. Authenticated browser/RSC inspection, Supabase ACL/RLS/RPC integration and CI remain pending. Migration gate remains blocked by the same four items and 45 legacy warnings; no merge or deployment occurred. Readiness remains **35/100 — NO-GO**.

## PostgreSQL contract harness — 2026-10-22

Added `scripts/test-public-discovery-postgres.mjs` and `npm run test:postgres:discovery`. On an ephemeral PostgreSQL 17 Alpine container, the harness created a disposable database, applied the two public-discovery migrations, and verified RPC ACLs, owner eligibility, and omission of private identifiers from public JSON. A review found the earlier assertion for direct table SELECT was vacuous because the synthetic schema granted no access. The corrected harness now models and explicitly confirms that legacy direct table/column SELECT grants remain present; these migrations do not revoke them. It is wired into `.github/workflows/quality.yml` with a PostgreSQL 17 service. The script now requires a loopback host and explicit destructive-test opt-in and cleans up temporary roles it creates.

Limitations: this uses a minimal synthetic schema and fixtures, without the full Supabase migration chain, PostgREST configuration, or a remote Supabase project. Docker could not start the complete Supabase stack because image layers exhausted available disk space. The generic PostgreSQL test is useful RPC-contract evidence but does not remediate direct table access or clear Supabase integration, migration provenance, authenticated E2E, or release gates. Do not mark the component verified until direct grants are migrated safely, and CI plus integration evidence are recorded.

### CI evidence — PR #33, 2026-10-22

GitHub Actions Quality run `39705924013` on immutable SHA `7d2f285ca868add408f82b16d36d3594cb8d95c7` passed dependency audit, lint, typecheck, all 68 tests, the PostgreSQL public-discovery contract and the production build. The workflow remains failed at the migration repository gate: two strict local migrations are absent from the baseline, and two historical reconciliation proposals remain pending. The snapshot contains 45 legacy migration warnings. This CI run proves the generic PostgreSQL contract in CI, not Supabase integration. PR #33 remains open/draft; no merge or production deployment occurred. The Vercel PR preview check completed successfully; it is not a production release.
## Booking eligibility transaction follow-up — 2026-10-22

CI run 39707978757 on `b3b5b32730c190906103ed230711e63de018eb77` passed dependency audit, lint, typecheck, automated tests, the PostgreSQL 17 disposable discovery/booking contract, and production build. It failed only at the migration repository gate (2 unregistered local forward SQL files and 2 unresolved historical records); the gate also reports 45 legacy filename warnings.

A database trigger proposal now serializes a professional booking insert with owner/profile moderation using row locks. It remains in `supabase/migration-proposals/`, outside the executable migration directory. PostgreSQL 17 local tests passed both lock orderings and the eligibility-state matrix. This is synthetic evidence only; RLS, actual trigger ordering, function owner privileges, and Supabase schema remain unverified. The proposal is not deployed or registered as applied.

Readiness remains **35/100 — NO-GO**. No Supabase remote changes, merge, or production deploy occurred. The pending reservation/Stripe behavior after a later suspension also needs a product and payment-flow decision.

## Quality CI follow-up — 2026-10-22

GitHub Actions Quality run `39708334447` on immutable SHA `167306189a23321fd40c9261bed31f112ad69fdd` completed with the same result: dependency audit, lint, typecheck, automated tests, PostgreSQL 17 contract, and production build passed; the workflow failed only at the migration repository gate. The exact blockers are the two forward migrations `20261022002606_revoke_legacy_public_radius_search.sql` and `20261022003244_secure_public_discovery_allowlist.sql` not being registered as applied, plus the historical entries `20260826034331_harden_private_community_post_visibility.sql` and `20260826042410_secure_public_discovery_contracts.sql` lacking reconciled remote history. The gate reports 45 legacy filename warnings.

This CI result does not resolve the direct `anon`/authenticated table SELECT exposure or verify Supabase integration. Keep readiness **35/100 — NO-GO**. Do not register unapplied migrations or repair historical records without authorized catalog evidence and the supported Supabase procedure. Main remains at `36ac94701c62175cd40c601e644edb2687c10ef1`; no merge, remote database write, or production deployment occurred.

## Migration necessity disposition — 2026-10-22

Read-only Supabase inspection and repository consumer search narrowed the pending historical list. `20260826042410_secure_public_discovery_contracts` is an archived proposal whose SQL differs from the current remote `SECURITY INVOKER` discovery functions; it was never established as applied and is not a required historical migration. It has been removed from `pending_forward_reconciliation` and marked `not_applied_archived_proposal` in the proposal manifest. Its desired discovery controls remain in the separate forward migration candidate.

The community history candidate `20260826034331_harden_private_community_post_visibility` remains unresolved. Current policies and helper implement the expected access rule, but supported historical repair still requires exact catalog review. The two forward migrations remain pending because they address public execution of row-returning legacy RPCs and owner eligibility/response minimization in discovery. They are not marked applied. The repository gate should now report two unapplied forward migrations plus one historical reconciliation; release remains blocked. No Supabase write, merge, or deploy occurred.

## Supabase forward remediations — 2026-10-22

Correction to the prior paragraph: both forward migrations were subsequently applied using the Supabase migration tool and reconciled to the versions it generated: `20261022101506_revoke_legacy_public_radius_search` and `20261022101921_secure_public_discovery_allowlist`. Post-apply ACL verification confirmed the legacy RPC restriction. Discovery remains `SECURITY INVOKER`, filters owner eligibility and uses a minimized JSON projection; Postgres contract CI passed on the candidate SQL. Security Advisor retained only the pre-existing public event-count definer and leaked-password warning, with no new discovery definer finding.

The only migration gate blocker now is historical provenance for the community proposal `20260826034331`. Current policy/helper effects are present; repair was not run because the Supabase CLI/authenticated CLI session is unavailable. The archived discovery proposal `20260826042410` has been removed from the pending list because it was never an applied migration. No manual migration-history insertion, merge, or production deploy. Direct table grants remain a separate security issue; readiness remains 35/100, Red/NO-GO.

## Migration gate closure — 2026-10-22

The community policy gap was closed forward, not by repairing or fabricating the old historical row. Supabase applied `20261022102137_enforce_community_post_visibility`, reasserting the current posts/comments/likes policies and removing the old broad policy names. A read-only catalog check confirmed those policies and the private membership helper afterward. The archived `20260826034331` proposal is marked superseded by this real forward migration, not applied. Repository integrity and `--release` migration gate now pass with zero pending forward migrations and zero unresolved historical reconciliations (45 legacy filename warnings remain non-blocking). Overall release readiness remains **35/100 — NO-GO** because direct table/column grants and other external readiness criteria remain open. No main merge or Vercel deploy.
## Security delta — 2026-10-22 10:32 UTC

- Applied forward migration `20261022103139_revoke_public_event_participant_count` through Supabase's supported migration tool.
- Catalog verification: `anon` and `authenticated` cannot execute `public_event_participant_count(uuid)`; `service_role` can. Security Advisor no longer reports this function as publicly executable `SECURITY DEFINER`.
- Remaining Supabase security finding: direct table/column `SELECT` grants to `anon` and `authenticated` on `professionals` and `sport_spaces`; leaked-password protection is disabled.
- Local checks: focused public-data-exposure tests 11/11; `node scripts/check-migrations.mjs --release` passed with zero pending migration records and 45 non-blocking legacy-name warnings. CI on the changed SHA has not run yet.
- Readiness remains 35/100, Red / NO-GO. PR #33 is draft and these changes are not in `main`; no production deploy.
- Vercel Preview for SHA `3ffb00ea105bf34fd85b1a9008651f261ba595d8` reached `READY`; authenticated `GET /api/health` returned HTTP 200 with `database=ok` and `stripe=missing`. CI Quality #39764173023 completed successfully: migration integrity, dependency audit, lint, typecheck, automated tests, PostgreSQL discovery contract, production build and evidence publication all passed.

## Profile table SELECT audit — 2026-10-22

Read-only catalog query confirmed table-level `SELECT` for `anon` and `authenticated` on both `professionals` and `sport_spaces`. Existing RLS permits public access to active rows; it does not restrict columns. Both tables contain non-public contact/identity, private-gallery, and Stripe-account fields. Initial source inventory found session-client reads, including broad `select('*')`, in owner dashboards/profile/gallery/billing/reviews/favorites. No data values were accessed, and no grants or policies were changed.

Remediation is tracked in Notion as F4S-NFR-SEC-DB-SELECT-01 / F4S-SEC-DB-SELECT-01. Complete callsite/column inventory and introduce owner-authorized server reads before revoking direct grants; preserve explicit public projections; validate denial and regression in CI and staging. The design is not implemented, so overall readiness remains 35/100 — Red / NO-GO. Quality run `39764768966` passed for docs commit `299e5162376405642579514c277ba301bdad93a7`; it is not remediation evidence.
