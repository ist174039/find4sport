# Find4Sport security and privacy review

Reviewed: 2026-10-18

This is an application-code review mapped to the project register (RGPD, ISO/IEC 27001/27002/27005, ISO/IEC 27018/27701, OWASP ASVS/API Security, Supabase Auth/RLS). It is implementation evidence, not a certification, legal opinion, or complete assessment of the deployed environment.

## Applied in the repository

- Auth callback and post-login redirects now accept same-origin paths only, including protection against protocol-relative URLs, encoded backslashes, malformed escapes, and control characters.
- Auth callback failures return fixed user-facing messages instead of raw Supabase errors or caller-supplied provider descriptions.
- Booking checkout uses the configured application origin helper for Stripe return URLs, validates that the request body is a JSON object, and no longer returns raw database/Stripe exception details to clients.
- Package, subscription, billing portal, and Connect API failures return generic client messages while preserving server-side error logging.
- The existing account-status implementation reads deactivation/deletion flags from server-managed auth app metadata; user-editable metadata is not trusted for authorization.
- Automated tests cover redirect normalization and rejection cases.

## Findings requiring deployment owner or privileged access

- Supabase Security Advisor reported leaked-password protection disabled. Enable and verify it in the Supabase Auth settings, then record evidence from the production project.
- The public `public_event_participant_count(uuid)` SECURITY DEFINER function is intentionally used as a public aggregate according to its migration comment. Review grants, argument validation, pinned `search_path`, and data minimization against the live definition. Do not remove public execution until product ownership confirms the public event-capacity requirement.
- Supabase reported ten multiple-permissive-policy findings and one unindexed foreign key. Review live policy definitions and production query workload before applying changes. Unused-index notices alone are not sufficient evidence to drop indexes.
- The production migration history and local files have timestamp/name mismatches. No migration or baseline reconciliation should be performed until the exact deployed SQL and provenance are recovered and reviewed.
- Stripe account reauthentication is required to inspect webhook configuration, restricted-key scope, Connect onboarding, and live/test separation.
- Confirm Vercel production deployment state, environment-variable scope, log retention/access, and origin configuration. The app must have `NEXT_PUBLIC_SITE_URL` or a trusted Vercel deployment URL in production; never use request Host as the Stripe return-origin source.
- A privacy owner must define retention/deletion periods, data-subject request handling, processor records, international transfer basis, and incident notification procedure. These cannot be inferred or completed by application code alone.

## Follow-up controls

- Add a periodic restore exercise and document RPO/RTO, evidence owner, and outcome.
- Add authenticated API abuse/rate-limit controls for public geocoding and payment-initiation routes at the edge or through a durable shared limiter. Per-process throttling is not sufficient for a multi-instance deployment.
- Add security tests for authorization boundaries, RLS policies, webhook signature failures, and payment idempotency using dedicated non-production accounts.
- Review whether event-manager self-registration remains a supported flow. Its callback attempts to mutate the role through the authenticated client, while the checked-in column-grant migration restricts direct updates to server-managed `type`; verify the production migration state and decide on an explicit, narrowly scoped provisioning mechanism.

