# FIND4SPORT — Production Readiness Gate

A release is eligible for production only when all of the following are true:

- GitHub Actions `Quality` passes on the exact commit being released.
- The Vercel production deployment points to that exact commit SHA and is `READY`.
- Supabase migrations for that commit are already applied and schema invariants pass.
- No P0/P1 runtime errors are observed after smoke tests.
- Smoke tests cover public discovery, authentication, reservation checkout, Stripe Connect, webhook persistence, chat realtime, notifications realtime, cancellation/change/refund, mobile navigation, and Admin operational views.
- Security Advisor has no unresolved application-owned high-risk findings.

Do not classify a release as production-ready when CI is green but Vercel is serving an older commit.
