# Find4Sport — module and server/client boundaries

Status: incremental convention for the existing Next.js App Router codebase. This is not a request for a repository-wide rewrite.

## Goals

- Keep privileged database, service-role and secret-dependent code out of client bundles.
- Make domain rules testable without loading Next.js, Stripe SDK or Supabase adapters.
- Keep authorization explicit at the server boundary.
- Preserve current route and component structure unless a small extraction materially improves testability or security.

## Current module map

### UI / browser modules

Typical locations:
- `components/**`
- files with `'use client'`
- client pages that only render data already minimized by a server boundary.

Rules:
- no service-role client;
- no secret access;
- no direct dependency on server-only adapters;
- pass stable public identifiers such as `space_id` instead of internal owner identifiers where the server can resolve ownership.

### App Router server boundaries

Typical locations:
- `app/api/**/route.ts`
- `app/actions/**`
- dashboard `actions.ts` files.

Responsibilities:
1. authenticate the request/session;
2. authorize role and resource;
3. validate/normalize input;
4. call pure domain/service logic or a privileged adapter;
5. map expected failures to stable user-facing responses;
6. revalidate/cache only after successful mutation.

These modules may import server Supabase clients, Stripe, Next.js request/response utilities and secrets.

### Pure domain/service modules

Typical location:
- `lib/<domain>/**`

Rules:
- no `next/server`;
- no direct Supabase client construction;
- no direct environment-secret reads when dependencies can be injected;
- accept dependencies or already-authenticated context;
- return domain results using platform-neutral `Response`/plain objects where practical;
- unit/integration tests can import these modules in the Node test runner.

Examples:
- `lib/billing/subscription-checkout-handler.ts`
- marketplace payment quote/settlement helpers;
- authorization and account-status helpers.

### Infrastructure adapters

Typical locations:
- `lib/supabase/**`
- Stripe/webhook infrastructure;
- external integration clients.

Rules:
- construct provider SDK clients and access credentials here or at an App Router server boundary;
- never import privileged adapters from a client module;
- minimize projections and DTOs before crossing to browser components.

### Database contract

- schema changes are forward migrations in `supabase/migrations/**`;
- unapplied proposals are explicitly tracked as `not_applied`;
- RLS/grant changes require disposable PostgreSQL contracts and managed non-production evidence before production application;
- service-role use remains server-only.

## Dependency direction

Preferred direction:

`UI -> App Router boundary -> pure domain/service -> infrastructure adapter / database`

A pure domain/service module must not import back from App Router or browser modules.

## Pilot: subscription checkout

The subscription checkout flow is the pilot for the convention:

- `app/api/stripe/checkout/route.ts` is a thin infrastructure wrapper.
- It constructs server dependencies: authenticated Supabase client, admin client, trusted origin resolver and Stripe SDK.
- `lib/billing/subscription-checkout-handler.ts` contains the flow:
  validation -> authentication -> commercial-role authorization -> plan lookup -> subscription lookup -> Stripe portal/checkout operation -> stable error response.
- Dependencies are injected, so the fail-closed behavior is exercised by Node tests without real Stripe or Supabase.
- A database lookup failure returns 503 before any Stripe call.
- An unauthorized or non-commercial account is rejected before any Stripe effect.

This extraction is deliberately narrow. It does not require other routes to migrate unless they benefit from the same separation.

## Review checklist for new or changed flows

- Is the file a browser/client module? If yes, it must not construct privileged clients or read secrets.
- Does a write accept a user/owner identifier supplied by the browser when it can derive it from the session? If yes, move derivation server-side.
- Can business rules be imported by the Node test runner without Next.js/provider SDK initialization?
- Are expected provider/database failures fail-closed before side effects?
- Are public DTOs explicit rather than wildcard row contracts?
- Are migrations and CI evidence linked to the corresponding requirement/task/test/evidence records?

## Exceptions

Provider SDK usage may remain directly in a route/server action when extracting it would add indirection without improving reuse, testability or authorization. The exception must remain server-only and retain focused tests.

This convention describes the incremental target used by PR #34; it does not claim every existing module already follows it.
