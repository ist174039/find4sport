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

The migration gate remains blocked on the two historical entries without remote history rows. A read-only review of the authorized Supabase project (`bqjwsllnhvnxrfojftjb`) found 81 remote migration records; exact SQL for all 23 post-cutoff records is now stored and checksum-verified. The detailed reconciliation is in `docs/migration-reconciliation-2026-10-21.md`. Do not infer historical provenance from current catalog state or alter remote history outside Supabase's supported repair process.
