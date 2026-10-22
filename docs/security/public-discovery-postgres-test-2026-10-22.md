# Public discovery PostgreSQL contract test — 2026-10-22

## Result

**Passed locally** against a disposable PostgreSQL 17 Alpine container. The test applied these repository migrations to a freshly created isolated database:

- `20261022002606_revoke_legacy_public_radius_search.sql`
- `20261022003244_secure_public_discovery_allowlist.sql`

Assertions passed for SQL parsing/application, legacy RPC execute privileges, public discovery RPC execute privilege, no direct `anon` SELECT on `sport_spaces`, owner eligibility, and public JSON field minimization. Synthetic fixtures verified that active owners and owners with expired suspensions are returned; currently suspended and blocked owners are excluded from both result sets, and ownerless spaces are excluded. The verified counts were 2 spaces and 2 professionals.

Command:

```sh
PUBLIC_DISCOVERY_TEST_DATABASE_URL='postgres://postgres:<local-password>@127.0.0.1:<port>/postgres' npm run test:postgres:discovery
```

The script creates a random disposable database, builds the minimum schema needed by these two migrations, applies the migrations, runs assertions, and drops the database.

## Limits

This is a migration contract test on PostgreSQL 17 with a minimal synthetic schema. It does not replay the full Find4Sport migration history, use Supabase-specific images/extensions/PostgREST, verify live Supabase grants or production schema, or validate authenticated browser flows. It does not change or reconcile migration provenance. The repository release gate remains blocked by two unregistered local migrations and two historical reconciliation proposals.

Observed workspace base HEAD: `dcbf3c0538b651c43f23ee73e990a0280fe5c2d1`; the worktree was modified and has no final immutable SHA. No remote service was contacted or changed.
