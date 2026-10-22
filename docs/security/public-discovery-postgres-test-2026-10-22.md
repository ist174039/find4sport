# Public discovery PostgreSQL contract test

## Scope and safety

The contract harness uses PostgreSQL 17 and creates a random disposable database. It creates any missing roles (`anon`, `authenticated`, `service_role`) only for the test server and drops roles it created after dropping the test database. It refuses non-loopback hosts, requires the `postgres` user and maintenance database, and requires the explicit `PUBLIC_DISCOVERY_TEST_ALLOW_DESTRUCTIVE=1` opt-in. This harness is intended for the isolated GitHub Actions PostgreSQL service or a disposable local container. It must not be run against Supabase or another remote database.

## Contract covered

The harness applies migrations `20261022002606_revoke_legacy_public_radius_search.sql` and `20261022003244_secure_public_discovery_allowlist.sql`. It checks migration execution, legacy/discovery RPC privileges, owner-state filtering, ownerless-space rejection and minimization of the public JSON DTO.

The synthetic baseline explicitly grants table-level `SELECT` on `professionals` and `sport_spaces` to `anon` and `authenticated`, matching the known broad-grant condition under review. The test confirms those direct grants and sensitive-column access remain present after these two migrations. This is an **unresolved exposure**, not a passing remediation. The discovery RPC migrations do not remove direct table grants.

## Limits

The test uses a minimal synthetic schema and fixtures. It does not replay the complete Find4Sport migration history, Supabase extensions, PostgREST configuration, real RLS policies, or production grants. It does not verify authenticated owner flows or full E2E. A passing run validates only this narrow RPC contract and makes the direct-grant gap explicit; it is not Supabase validation or release approval.

Command for a disposable local PostgreSQL server:

```sh
PUBLIC_DISCOVERY_TEST_ALLOW_DESTRUCTIVE=1 \
PUBLIC_DISCOVERY_TEST_DATABASE_URL='postgres://postgres:<local-password>@127.0.0.1:<port>/postgres' \
npm run test:postgres:discovery
```

The GitHub Actions Quality workflow sets the opt-in only for its disposable PostgreSQL service.
