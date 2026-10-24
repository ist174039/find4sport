# Find4Sport — Growth and valuation evidence

Integrated code source of truth: GitHub `main`. Requirements, architecture, priorities, tasks and evidence source of truth: [Notion implementation plan](https://app.notion.com/p/39cbe9392b60831cbbc28143e5462ab7) and [growth task](https://app.notion.com/p/400be9392b6081779373ee7702a0efec). This file is a technical snapshot; priorities and decisions are maintained in Notion.

Goal confirmed on 2026-10-21: acquire customers and generate revenue over the next three months across venues, professionals and events. Existing users are confirmed. The owner clarified that users currently join free and revenue is a later goal; active counts and actual revenue remain unverified. This is a proposed delivery sequence, not a valuation guarantee.

| ID | Priority | Delivery and acceptance | Dependency / status |
| --- | --- | --- | --- |
| V01 | P0 | Independent Quality checks after successful install; SHA and per-check outcome in run summary; any failure still fails Quality | Verified in CI run 39665221015; Quality correctly failed on migration/audit checks |
| V02 | P0 | Reconcile seven migrations with exact deployment SQL/history, reviewed ACLs and schema effects | Recorded SQL recovered on 2026-10-21; seven version mismatches and two unrecorded baseline entries remain; retain gate |
| V03 | P0 | Isolated Preview fixtures, role accounts, protected secrets and repeatable reset | Test services/configuration required |
| V04 | P0 | Booking, event capacity, package ownership/credits, concurrent conflict and cancellation tests pass with consistent data | V02–V03 |
| V05 | P0 | Test checkout, Connect, duplicate/out-of-order webhooks, refunds and reconciliation with consistent ledger | V02–V03 and Stripe test access |
| V06 | P0 | Evidence for restore, rollback, alerts, export/deletion and retention with synthetic data | Operational/legal ownership and test environment |
| V07 | P1 | Reconciled segment metrics: activation, visit-to-contact/booking, payment completion, 30-day repeat use, cancellations, net platform revenue, CAC and margin | Establish real baseline; privacy review before tracking |
| V08 | P1 | Validate onboarding to published, priced, available and payment-ready offering for every provider type; measure abandonment | Baseline and tested flows |
| V09 | P1 | Mobile discovery/contact/booking, keyboard/focus, empty/error states and performance checks; before/after measures | Preview; define automated a11y/regression checks |
| V10 | P1 | Verify transactional notifications, reminders, contact follow-up and support recovery; no duplicates | Consent/preferences and delivery tests |
| V11 | P1 | Segment interviews and pricing/acquisition/referral experiments with measured cost and results | Customer counts and budget; explicit outreach/campaign instructions |
| V12 | P2 | Reviewable ownership/licensing, costs, contracts, architecture, release evidence and monthly business metrics | Verified sources; restricted personal/contract data |

## Migration and release status — 2026-10-22

The V02 details above are historical. The latest candidate Quality run `39767772722` on `885909e64d23a6ebbc9882a744fad54aa6c54dd7` passed repository migration integrity with zero pending forward migrations and zero unresolved historical reconciliations; 45 legacy filename warnings remain. Do not change baseline/history to simulate application. Remote provenance and release readiness still require their own evidence. Direct profile-table SELECT exposure, authenticated E2E, leaked-password protection and privacy review remain blockers; `main` and production are still at `36ac94701c62175cd40c601e644edb2687c10ef1` and release is NO-GO.

## Measurement

Keep transaction volume separate from platform revenue. Exclude test data and account for refunds. Record definitions, source, period, denominator and verification date. Do not invent targets or infer paying customers from registrations.

## Sequence

Start V01–V06 while establishing V07; then prioritize V08–V10 weekly using customer impact across all three segments. Run V11 once baseline and commercial decisions exist; maintain V12 monthly. F38–F40 remain exploratory proposals until validated demand justifies delivery.

## Evidence

Every delivery links requirement/capability, task, commit, case, environment, outcome and date. Local validation does not establish remote CI success or production readiness. Required migrations/security/payment gates remain blocking.

V01 implementation: retain the existing static-checks job and check names; each check uses an explicit cancellation/install condition, without continue-on-error. Therefore later checks can run after a prior failure and the job still fails. Summary includes the commit and all outcomes. No deployment step is added.

## Confirmed acquisition-first decision

Prioritize a useful first action and repeat use before introducing monetization. Track registrations, published profiles/offers, first useful action, answered contacts, completed registrations/bookings and 7/30-day repeat use separately for venues, professionals, organizers and athletes. Define events and denominators before setting numerical targets. Start V11 with interviews and organic acquisition; pricing changes and paid campaigns require a later commercial decision. V01–V06 still address the technical confidence needed for existing users.
