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
