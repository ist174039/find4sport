# Acquisition-first measurement contract (V07)

Canonical task: [V07 — Definir baseline de ativação e retenção gratuita](https://app.notion.com/p/400be9392b608106b47be4f558fb8433). Source plan: [08 — Plano de Implementação](https://app.notion.com/p/39cbe9392b60831cbbc28143e5462ab7). QA evidence: [QA & Rastreabilidade](https://app.notion.com/p/3febe9392b60817aa00cca8c06b44fa5). Notion is the task/status source of truth; this file specifies the implementation contract.

Status: offline calculation implemented; production collection, export adapters, baseline and dashboard remain pending. This module does not collect events, write data or call a tracking SDK. Its output is only as complete as the supplied historical account/action exports. These metric definitions are explicit proposals for product review, not claimed commercial results.

`lib/analytics/activation-metrics.ts` accepts pseudonymous account IDs, a declared segment, registration timestamp and explicit test-data classification, plus unique useful-action records. No names, email addresses, phone numbers or coordinates belong in the input. The existing domain types expose registration/creation timestamps and resource statuses, but do not establish a complete historical event stream or a reliable test-account marker. Do not infer activation dates from `updated_at` or treat all historical rows as production data.

## Definitions

| Measurement | Definition | Denominator |
| --- | --- | --- |
| Registered | Unique non-test accounts registered in `[cohortStart, cohortEnd)` | Count, independent of payment |
| Activation | At least one useful action in `[registration, registration + 7 days)` | Registered cohort members whose complete first seven days are observable |
| 7-day retention | Activated member performs another useful action in `[registration + 7 days, registration + 14 days)` | Activated members observed for at least 14 days |
| 30-day retention | Activated member performs another useful action in `[registration + 30 days, registration + 37 days)` | Activated members observed for at least 37 days |

Retention measures a seven-day return window, not activity exactly on day 7 or day 30. All windows use elapsed 24-hour days and absolute instants, not Lisbon civil-day boundaries; explicit timezone is required. Rates are fractions from 0 to 1; absent denominators return `null`, not an invented 0%.

Useful actions currently allowed by the contract are offer publication, contact response, confirmed booking and confirmed event registration. Export adapters must attribute each action to the actor that actually performed it: a provider's answer must not activate the contact sender. Map source states carefully: contact `responded`, reservation/registration `confirmed` or `paid`, event `published`, and active professional/space states are candidates for review, not automatic proof of a past transition or action time. A login, view or free registration alone is not a useful action. Counts do not imply payment or revenue.

## Integrity and snapshot rules

- Every account and action ID must be nonempty and unique. Duplicate exports fail explicitly; deduplicate identical rows upstream and investigate conflicting ones.
- Test accounts and test actions are excluded. Missing test classification fails explicitly so unknown data is not silently included.
- Unknown-account actions, actions before registration and actions after `asOf` are excluded. An adapter should audit these export omissions separately.
- Cohort end is exclusive and cannot exceed `asOf`; actions at the snapshot are observable. Future cohort accounts are never counted.
- Multiple actions count an account once per measurement. Segment filtering uses the explicitly supplied cohort classification; no inference from names or emails.
- Supply complete history through `asOf`, including useful actions outside the registration cohort dates. Missing event history must be reported as missing evidence, not interpreted as real inactivity.
- Record the source, export/version, snapshot, cohort and chosen segment beside every reported result. Do not log input IDs in public client telemetry.

## Next implementation steps

1. Review proposed action/window definitions with product for each segment.
2. Identify authoritative registration and historical transition timestamps and a maintained test-data registry in an isolated environment.
3. Implement and reconcile export adapters with aggregate source totals; do not fabricate historical timestamps.
4. Run calculation against validated exports, record baseline and then choose growth targets.
5. Add a restricted aggregate dashboard only after access, privacy and completeness review.

## Verification

`node --experimental-strip-types --test tests/activation-metrics.test.mjs` covers real/test separation, registration versus activation, complete-window eligibility, half-open boundaries, timezone equivalence, unique user counts, segment filtering, duplicate input rejection and invalid input. The repository's existing `npm test` automatically includes this file, and the Quality workflow already runs that command. A local pass does not establish remote CI execution or a measured production baseline.
