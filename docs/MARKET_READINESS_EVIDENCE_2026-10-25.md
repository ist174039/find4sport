# Find4Sport — Market Readiness Evidence Dossier

**Snapshot:** 25 October 2026  
**Status:** NO-GO for release  
**Candidate branch:** `feat/mobile-first-hmi-completion`  
**Last validated candidate before this document:** `47239a0d8f266f9c92505e9383b72d6cf8cff64f` — Quality #725 PASS

This dossier is an evidence index, not a declaration of production readiness, WCAG/ISO/GDPR conformity, traction, revenue, or valuation. Where execution requires an isolated managed environment, the limitation is stated explicitly.

## 1. Source hierarchy

1. Project Definition & Delivery in Notion.
2. Operational Notion tables: Requirements, Tasks & Deliverables, Standards & Controls, Architecture Components, Sequence Diagrams, Test Cases, Executions & Evidence, Decisions & Risks.
3. GitHub `main` for current production-bound code truth.
4. Candidate PR #34 for work not yet promoted to `main`.

## 2. Candidate quality evidence

Quality #725 passed on candidate SHA `47239a0d8f266f9c92505e9383b72d6cf8cff64f`.

The required workflow checks passed:
- dependency installation;
- migration repository integrity;
- dependency audit;
- lint;
- TypeScript typecheck;
- automated tests;
- disposable PostgreSQL public discovery contract;
- disposable PostgreSQL profile-table least-privilege contract;
- disposable PostgreSQL event-write boundary contract;
- production build;
- quality evidence publication.

A green Quality run is necessary but not sufficient for release under the production runbook.

## 3. Security and data-minimisation evidence

### Public discovery

Legacy public radius-search RPC access has been revoked in the observed Supabase catalogue. Public discovery uses explicit DTO/allowlist contracts rather than full row payloads.

### Profile-table least privilege

Pending migration:
`supabase/migrations/20261025221000_restrict_profile_table_select_columns.sql`

Purpose:
- remove broad direct SELECT from `professionals` and `sport_spaces`;
- grant only an explicit generic public-column allowlist;
- keep internal ownership identifiers and sensitive/contact/financial fields outside generic direct reads;
- move related-table ownership checks behind `app_private` SECURITY DEFINER helpers.

Evidence:
- disposable PostgreSQL contract passes in Quality #725;
- migration is registered as `not_applied`;
- production grants were not changed.

### Event creation boundary

Pending migration:
`supabase/migrations/20261025224500_revoke_browser_event_insert.sql`

Purpose:
- remove the generic browser INSERT policy on `events`;
- revoke INSERT on `events` from `anon` and `authenticated`;
- retain server/service-role write capability.

Evidence:
- server action validates session, role, entitlement, category and paid-event configuration;
- disposable PostgreSQL contract passes in Quality #725;
- migration is registered as `not_applied`;
- production grants were not changed.

### Authenticated server boundaries

Evidence recorded in Notion and CI covers:
- registration bootstrap deriving ownership from the authenticated session;
- restricted-account page using server-side authenticated lookup and minimal projection;
- billing dashboard reads behind an authenticated server action;
- follower/following enrichment behind a server boundary with eligibility checks.

## 4. Financial controls

### Subscription checkout fail-closed

Evidence `F4S-RUN-PAY-FAILCLOSED-CI-20261025` proves with mocked dependencies that:
- a `user_subscriptions` lookup error returns HTTP 503;
- neither Stripe Checkout nor Billing Portal is called on that error;
- a managed subscription opens Billing Portal;
- an eligible user without a managed subscription opens one Checkout session.

### Marketplace quote fail-closed

Evidence `F4S-RUN-PAY-QUOTE-FAILCLOSED-CI-20261025` covers:
- errors in profile/professional/space/subscription/plan lookups;
- plan-state rules;
- invalid rates;
- Connect readiness;
- consumer ordering: quote resolution precedes Checkout creation;
- package checkout does not instantiate the Stripe client before a valid quote.

### Billing totals

The dashboard server action limits loaded data to 500 transactions and 100 reservations. The UI now consumes the truncation flags and displays an explicit **Totais parciais** notice. When truncated, cash-in, cash-out and net totals are labelled as loaded-sample values rather than historical all-time balances.

### Stripe Test Mode

Read-only verification found:
- the Find4Sport test webhook enabled for the expected checkout/subscription/invoice/refund/dispute/transfer/payout event families;
- at least one Connect test account with payment and transfer capabilities ready.

No real payment, test payment, refund, transfer, payout, customer mutation or connected-account mutation was executed during this readiness cycle because there is no isolated candidate application environment.

## 5. HMI, mobile-first and accessibility

Implemented candidate controls include:
- 320–430px mobile-first contracts;
- 44px minimum interactive targets where applicable;
- visible focus treatment;
- filter dialog focus entry, Tab/Shift+Tab containment, Escape close and focus return;
- removal of audited 9/10/11px microtype;
- semantic status/rating tokens;
- mobile discovery, cards, feed, Home and dashboard navigation regressions.

These are implementation and automated-contract evidence only. They do **not** establish WCAG 2.2 AA or ISO 9241 conformity.

Still required:
- authenticated browser execution;
- manual keyboard traversal;
- zoom/reflow and contrast verification;
- assistive-technology execution;
- multi-viewport screenshots and observed task completion.

## 6. Privacy and continuity

Runbook:
`docs/PRIVACY_CONTINUITY_VALIDATION.md`

Prepared cases:
- T31 — privacy/data-subject requests and retention;
- T36 — continuity, restore and rollback.

Both require an isolated environment and synthetic data. They have not been executed against production and production must not be used as the substitute test environment.

## 7. Environment and release blockers

### Vercel

A candidate deployment was explicitly requested and rejected by Vercel with HTTP 402 because the Hobby account exceeded the daily API deployment quota. The candidate therefore has no Vercel preview evidence yet.

### Supabase isolated environment

No Supabase development branch exists. The provider quoted branch compute at USD 0.01344/hour. The project owner explicitly declined that paid branch. No branch was created and no cost was incurred.

Consequences:
- pending ACL/RLS migrations remain `not_applied`;
- T31/T36 cannot be completed against managed Supabase;
- authenticated role E2E cannot use a managed candidate data environment.

### Authentication hardening

Supabase Security Advisor still reports leaked-password protection disabled. The connected tool surface used in this cycle does not expose a safe Auth-configuration write operation. The setting remains open.

## 8. Owner decisions

- Do not create the paid Supabase development branch at USD 0.01344/hour.
- Do not use production as a destructive or synthetic test environment.
- Do not apply pending grants/migrations to production without isolated evidence.
- Do not create real payments or modify customer/account credentials during readiness validation.

## 9. Release decision

**Current decision: NO-GO.**

PR #34 must not be promoted to `main` under the stated 100% criterion while the following remain without observed evidence:
- candidate Vercel deployment;
- managed isolated ACL/RLS validation of pending migrations;
- leaked-password protection;
- authenticated role E2E;
- manual/assistive accessibility execution;
- privacy/retention exercise;
- restore/continuity exercise;
- isolated end-to-end Stripe journey.

This dossier should be updated when any of those gates changes. It intentionally distinguishes code/CI evidence from managed-environment and human validation.
