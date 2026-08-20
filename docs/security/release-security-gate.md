# Find4Sport Release Security Gate

This checklist is a release gate, not a best-effort review. A release candidate must not ship with an unresolved Critical/High item.

## Authentication and authorization

- [ ] Anonymous users cannot access authenticated dashboard data or mutations.
- [ ] Non-admin users cannot access admin data or invoke admin mutations directly.
- [ ] Admin authorization is checked server-side before every service-role operation.
- [ ] Role changes cannot be performed by the affected user unless explicitly permitted.
- [ ] Authentication failures do not disclose whether an account exists.

## Ownership / IDOR

For every user-controlled resource identifier, test read, update and delete using a second account.

- [ ] Profiles
- [ ] Professional records and services
- [ ] Venue records and services
- [ ] Reservations / bookings
- [ ] Communities and events
- [ ] Reviews
- [ ] Messages / conversations where applicable
- [ ] Billing/subscription records
- [ ] Uploaded media

Expected result: the server/RLS rejects access when the authenticated principal does not own the resource and does not have an authorized administrative role.

## Supabase / RLS

- [ ] RLS is enabled on every table exposed through the client API unless exposure is explicitly justified.
- [ ] SELECT, INSERT, UPDATE and DELETE policies are reviewed independently.
- [ ] Public policies expose only fields/data intended to be public.
- [ ] SECURITY DEFINER functions have an explicit safe search_path and minimum grants.
- [ ] Views/functions do not accidentally bypass the intended authorization boundary.
- [ ] Service-role credentials are never imported into client components or returned to the browser.

## Admin service-role usage

Every `createAdminClient()` call must have a documented trust boundary.

- [ ] Caller is server-only.
- [ ] Authentication occurs before privileged access.
- [ ] Authorization is checked before privileged access.
- [ ] User-supplied IDs are validated and scoped.
- [ ] Mutations produce an audit record where operationally significant.

## Payments and subscriptions

- [ ] Prices charged to customers are resolved server-side from trusted plan/product data.
- [ ] Client-supplied totals, commission values and entitlement values are never authoritative.
- [ ] Stripe webhook signatures are verified.
- [ ] Webhook processing is idempotent.
- [ ] Subscription ownership is checked before portal/cancellation/update operations.
- [ ] Refund/financial admin operations require explicit admin authorization and audit logging.
- [ ] Failed or partially completed Stripe/database mutations have a defined reconciliation path.

## Input and browser security

- [ ] Server Actions validate type, range, length and allowed values for untrusted input.
- [ ] Uploads validate MIME/type, size and storage path server-side.
- [ ] Stored/rendered user content cannot inject executable HTML/script.
- [ ] Redirect targets cannot be controlled to create an open redirect.
- [ ] Security headers/CSP are appropriate for production integrations.
- [ ] Sensitive endpoints have appropriate abuse/rate controls.

## Release evidence

- [ ] `Quality` workflow passes: dependency audit, lint, typecheck, production build.
- [ ] `E2E Smoke` passes in Chromium and mobile Chromium.
- [ ] Authenticated E2E credentials exist for athlete, professional, venue manager and admin.
- [ ] Authorization-negative tests exist for admin access and at least the critical ownership boundaries.
- [ ] Production `/api/health` is healthy.
- [ ] No unresolved Critical/High security finding.

## Severity rule

- **Critical:** direct compromise of secrets, payment integrity, broad privileged access or destructive cross-tenant access. Blocks release.
- **High:** privilege escalation, meaningful IDOR, authorization bypass, unsafe financial mutation or sensitive-data exposure. Blocks release.
- **Medium:** exploitable weakness with constrained impact or prerequisites. Fix before GA unless explicitly accepted.
- **Low:** defense-in-depth or limited-impact weakness. Track with an owner and target date.
