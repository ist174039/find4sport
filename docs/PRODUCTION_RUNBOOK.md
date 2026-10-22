# Find4Sport Production Runbook

## Purpose

This runbook defines the minimum operational controls required to keep Find4Sport stable in production. It is a hardening and maintenance document; it must not be used to justify shipping new product scope while production gates are failing.

## Release gate

A release is eligible for production only when all applicable checks below are green:

1. GitHub `Quality` workflow passes on Node 24: install, dependency audit, lint, typecheck and production build.
2. Vercel production deployment reaches `READY`.
3. `E2E Smoke` passes against `https://find4sport.vercel.app` on desktop Chromium and mobile Chromium.
4. Vercel runtime errors contain no new unexplained error cluster caused by the release.
5. Supabase Security Advisor has no unresolved application-level RLS issue. Platform-level warnings that cannot be changed through migrations must be tracked explicitly.
6. Any release touching reservations, payments, subscriptions, settlement, refunds or Stripe webhooks must be verified in Stripe Test Mode before production use.
7. No database schema change is accepted without a tracked Supabase migration.

A green build alone is not a production approval.

## Post-deploy validation

After each production deployment:

- Confirm the production deployment is `READY`.
- Confirm home, professionals, spaces, events, communities and login return without server errors.
- Confirm mobile smoke does not introduce horizontal overflow.
- Review new Vercel runtime error groups.
- Review Supabase API/Auth/Postgres logs when the release changes authentication, RLS or database access.
- For payment-related changes, verify webhook processing and database ledger consistency in Test Mode.

## Incident severity

### P0 — Critical

Examples: unauthorized data access, privilege escalation, incorrect payment capture, duplicate payment, payout/settlement corruption, widespread authentication failure, destructive data corruption.

Actions:

1. Stop further releases.
2. Disable or isolate the affected flow where possible without corrupting data.
3. Preserve Vercel, Supabase and Stripe evidence before making broad changes.
4. Roll back the application when the incident was introduced by a deployment and rollback is safer than a forward fix.
5. Reconcile affected financial/database records before declaring recovery.
6. Add a regression test before closing the incident.

### P1 — High

Examples: reservations failing, professional/space dashboards unusable, admin operation failing, persistent 5xx on an important route, broken webhook processing without financial corruption.

Actions: stop related releases, diagnose from runtime/database logs, fix or roll back, add regression coverage, verify the full affected flow.

### P2 — Moderate

Examples: isolated UI failure, responsive regression, non-critical query failure, degraded performance with a workaround.

Actions: fix in normal hardening flow and add coverage when regression risk is material.

## Rollback rule

Prefer rollback when:

- a newly deployed change causes broad production failure;
- the previous deployment is known-good;
- a forward fix would require speculative database or payment changes.

Do not blindly roll back a release that already executed irreversible migrations or financial side effects. In those cases, assess database compatibility first and prefer a controlled forward fix when rollback would worsen integrity.

## Database rules

- Production DDL is applied only through Supabase migrations.
- RLS policies are treated as application security boundaries and must be reviewed like code.
- Internal audit/history tables remain inaccessible to `anon` and `authenticated` unless a concrete product requirement proves otherwise.
- Avoid adding or removing indexes solely because an advisor labels them unused; use query patterns and production evidence.
- Schema drift between application queries and Supabase is a release blocker.

## Stripe rules

- Keep marketplace/payment development in Stripe Test Mode until end-to-end flows are repeatable.
- Treat webhook event IDs as idempotency boundaries.
- Never infer payment success only from the browser redirect; authoritative state comes from verified Stripe events/server-side retrieval.
- Reconcile Stripe state against Find4Sport reservations, subscriptions and transaction ledger for financial incidents.
- Do not enable Live Mode for a flow that lacks regression coverage and an operational recovery path.

## Security rules

- Test authorization with at least: anonymous user, normal user A, normal user B, professional, space owner and administrator.
- Every sensitive mutation must remain safe when called directly, bypassing the UI.
- Do not trust client-provided ownership, role, price, payment status or settlement state.
- Any discovered authorization bypass is P0 until scope is proven otherwise.

## Maintenance policy

Until the platform reaches the agreed production maturity target, work is limited to:

- bug fixes;
- security hardening;
- test coverage;
- performance and database reliability;
- observability and operational tooling;
- UX/UI consistency and responsive fixes to existing flows;
- architecture simplification and removal of dead/fake behavior.

New product functionality remains out of scope.

## Continuity and recovery record (ISO 22301)

This runbook is the operational continuity procedure for application incidents. The service owner must approve and maintain the recovery objectives below; do not infer them from platform defaults.

| Continuity item | Current record | Required evidence / owner |
| --- | --- | --- |
| Recovery time objective (RTO) | Not agreed | Product and operations must set a maximum restoration time |
| Recovery point objective (RPO) | Not agreed | Product and operations must set acceptable data loss for each critical data class |
| Supabase backup and point-in-time recovery | Not verified in this repository | Supabase project owner records plan, retention, restore point and last restore exercise |
| Vercel recovery | Documented as deployment rollback, subject to database compatibility | Release operator records deployment IDs and rollback decision |
| Stripe financial recovery | Reconcile events, reservations, transfers and ledger; never replay blindly | Finance/operations preserves Stripe event IDs and reconciliation output |
| Communications and incident owner | Not assigned | Service owner names incident lead, technical lead and customer communications owner |
| Exercise cadence | Not established | Service owner schedules and records a tabletop plus restore exercise at least annually |

### Continuity response

1. Declare the incident, record start time, severity, incident lead and affected flows.
2. Preserve deployment IDs, Vercel runtime error groups, Supabase logs and relevant Stripe event IDs before remediation.
3. Restore application availability by rollback only after checking database compatibility. For data recovery, use the Supabase owner's approved restore procedure and record the chosen recovery point and expected data loss.
4. Reconcile reservations, payments, refunds and payouts against Stripe before reopening affected financial flows.
5. Confirm the health endpoint, critical public routes and role-based smoke suite; record timestamps and results.
6. Close only after the incident lead records impact, recovery time, data loss, customer communications, follow-up owner and corrective action.

## Operational evidence to retain

For each release or incident, retain the commit SHA, Quality workflow URL/result, E2E Smoke workflow URL/result, Vercel production deployment ID/status, health endpoint response, unresolved runtime error groups, Supabase migration/security review, and (for payment changes) Stripe Test Mode evidence. A passing repository check does not prove production migration parity; confirm the Supabase migration history and schema/security state through the authorized project operator.

The repository's current migration gate checks filename and baseline consistency only. It does not query the live database. Do not add a migration to `supabase/migration-baseline.json` until its production version and name have been verified against Supabase migration history.

### Find4Sport project review (2026-10-18)

The authorized project is `bqjwsllnhvnxrfojftjb` (`supabase-bronze-magnet`), running PostgreSQL 17.6.1.127. The read-only snapshot contains 81 migration history rows and exact SQL for the 23 entries after the cutoff. On 2026-10-21 the seven local version mismatches were archived outside the executable migration folder, and the exact remote SQL restored under its recorded version/name. Two prior baseline entries still have no remote history row; live catalog observations do not establish their historical provenance. The gate intentionally remains blocked on these two cases. See `docs/migration-reconciliation-2026-10-21.md`; do not replay proposals or alter remote history without supported, reviewed evidence.

The Security Advisor reports leaked-password protection disabled and `public.public_event_participant_count(uuid)` executable by `anon` and `authenticated` as a SECURITY DEFINER function. Its current body returns only an aggregate of confirmed/paid participants for published/completed events, and the migration documents the intended public capacity aggregate. Treat exposure as an explicit accepted-risk decision and review the function's grant/search-path behavior; enable leaked-password protection in Supabase Auth settings. The Performance Advisor also reports one unindexed FK, 65 unused-index notices, and 10 groups of permissive policies. Review policies and workload before any index removal; advisor findings alone are not sufficient evidence to drop indexes.

Vercel read-only inspection found the latest production deployment READY on commit `d38f4c1dbd35a7c94f33a51d92b9857fd4d57d4c`, while the project `live` field was false. Confirm the serving deployment and production domain with the release operator. Stripe account access required reauthentication, so no account settings or Test Mode evidence were reviewed.

## Observability coverage and gaps

`GET /api/health` is the current readiness probe. It performs a read against `subscription_plans`, reports whether the Stripe secret and webhook secret are configured in production, returns a commit/deployment identifier, and disables caching. A healthy response is useful for dependency reachability, but it is not a full service-level objective or a synthetic transaction.

Until dedicated metrics and alert rules are configured, the on-call operator must review these signals in the provider dashboards after release and during incidents:

| Signal | Source | Escalate when |
| --- | --- | --- |
| HTTP 5xx and latency/error groups | Vercel runtime logs and deployment insights | New unexplained cluster or sustained failure on a critical route |
| Database/API/Auth errors and migration history | Supabase logs, migration history and Security Advisor | RLS/security finding, schema mismatch, or sustained query/auth failures |
| Checkout, webhook delivery and ledger reconciliation | Stripe event delivery plus Find4Sport transaction/audit records | Failed or delayed critical event, duplicate effect, or ledger mismatch |
| Chat, notification and settlement jobs | Supabase Realtime/Edge Function logs and Vercel cron logs | Persistent delivery failure, retry buildup, or partial settlement failure |
| Public and mobile user journeys | Scheduled E2E Smoke workflow artifacts | Any critical route, authentication boundary or mobile viewport check fails |

No quantitative availability, latency, webhook-delivery or recovery alert thresholds are approved yet. The service owner must define those targets, alert routing and dashboard ownership before claiming continuous operational monitoring.
