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
