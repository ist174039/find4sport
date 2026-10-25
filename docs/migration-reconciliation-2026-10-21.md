# Migration reconciliation — 2026-10-21

Project: `bqjwsllnhvnxrfojftjb`. Evidence source: read-only query of `supabase_migrations.schema_migrations`. The checked-in export contains all 81 version/name pairs and SQL for the 23 rows at or after the baseline cutoff. It is a dated snapshot; it does not prove the current production schema.

## Exact history restored

The seven local strict files that used versions different from same-name remote entries have been preserved under `supabase/reconciliation-proposals/`. Each is non-executable by the migration runner, and its SHA-256 plus disposition is recorded in that folder's manifest. The seven exact remote-version files now live under `supabase/migrations/`, with SQL copied byte-for-byte from the read-only provenance export. All 23 post-cutoff history entries are registered with matching names, checksums, and recorded SQL. The two additional historical files that had formatting drift were normalized to the exact recorded SQL as well.

These files restore repository provenance; they do not authorize replay. In particular, the local provider identity proposal included a backfill absent from the remote historical migration. That proposal remains archived and was not run. The recorded history includes the later `allow_multi_provider_capabilities` change, and the inspected current function matches that later athlete-only normalization; the current owner check found zero approved claims without a space owner.

## Historical candidates and disposition

`20260826034331_harden_private_community_post_visibility` and `20260826042410_secure_public_discovery_contracts` were present in the earlier local baseline but have no matching row in the remote history snapshot. Their SQL files are archived outside the executable migration directory. The community policy remains a historical reconciliation candidate because the current catalog appears to implement its intended visibility rule. The discovery file is an archived proposal, not an executable historical migration: the remote function definition differs. It is therefore excluded from pending history reconciliation and must not be marked applied.

The gate treats only the community version as a pending historical reconciliation and fails release on it. Do not add it to reconciled history, insert old rows manually, or replay archived SQL. An authorized database operator must compare the complete current catalog and, if equivalent, use Supabase's supported `migration repair --status applied` for that version. Any actual drift requires a reviewed, forward-only migration tested in an isolated database.

## Validation and release status

`node scripts/check-migrations.mjs` now verifies both directions of the 23-row history snapshot, exact recorded SQL, checksums, archived proposal checksums, and explicit pending reconciliation records. The focused gate tests pass 8/8. The migration gate still fails on exactly the two unrecorded history cases; it also emits 45 warnings for legacy timestamp filenames, which are not gate blockers but still need inventory review.

On 2026-10-22 the authorized Supabase MCP connection re-read the remote migration list: the same two versions remain absent. A fresh read-only catalog query observed the community post/comment/like visibility policies and the expected discovery functions. Discovery functions use SECURITY INVOKER with restricted ACLs; the public participant aggregate remains SECURITY DEFINER with public-role execute grants and is a separate risk-register item. This query is point-in-time evidence, not history repair. The Supabase CLI 2.121.0 exposes the supported `migration repair --status applied` operation, but this workspace has no linked CLI config or access token, so no repair was run.

No production SQL was executed, no remote migration history was changed, and no deployment was made.

Release remains blocked until the two history exceptions are resolved through supported, reviewed evidence and the full CI/release gate passes on the candidate commit.

## Security source correction and forward proposals — 2026-10-22

The previous paragraph describing discovery functions as `SECURITY INVOKER` reflected the archived proposal, not the executable historical SQL. Follow-up inspection of `supabase/migrations/20260816_zz_public_discovery.sql` found both professional and space discovery functions defined as `SECURITY DEFINER`, selecting full rows and serializing them. The archived `20260826042410_secure_public_discovery_contracts.sql` remains a proposal and must not be replayed.

Two forward migrations are present locally: `20261022002606_revoke_legacy_public_radius_search.sql` and `20261022003244_secure_public_discovery_allowlist.sql`. Their exact paths and SHA-256 checksums are recorded under `pending_forward_migrations` with status `not_applied`; they have not been applied remotely. The repository integrity gate can pass while accurately reporting these pending migrations and the one unresolved community-history reconciliation. The archived discovery proposal is explicitly `not_applied_archived_proposal` in the proposal manifest and is not a gate blocker. The release gate remains blocked by the two pending forward migrations and the community history row.

## Disposition update — 2026-10-22

Read-only inspection confirms the current remote `discover_professionals` and `discover_spaces` are `SECURITY INVOKER`; the remote definitions differ from the archived `20260826042410` proposal. That proposal was never a remote migration and must not be applied or repaired into history. Its intended controls (owner eligibility and minimized response) are handled only by the separate forward migration candidate. Current community policies and `app_private.can_view_community(uuid)` match the expected behavior closely; exact full catalog review is still required before supported history repair.

## Forward security migrations applied — 2026-10-22

The supported Supabase migration operation applied both reviewed forward SQL files. Supabase generated actual versions `20261022101506_revoke_legacy_public_radius_search` and `20261022101921_secure_public_discovery_allowlist`; the local migration filenames, checksums, baseline and provenance snapshot were synchronized to those returned versions and exact submitted SQL.

Read-only verification after application confirmed both legacy radius RPCs are non-executable by `PUBLIC`, `anon` and `authenticated`, and remain executable by `service_role`. The two public discovery functions are `SECURITY INVOKER`, have fixed `search_path=pg_catalog, public`, and execute for anon/authenticated. Their SQL filters active or expired-suspension owners, excludes ownerless spaces, and builds explicit JSON objects without owner IDs or listed private fields. Security Advisor still reports the pre-existing public participant-count definer function and leaked-password protection warning; the discovery change added no new definer warning.

Direct table/column SELECT grants for anon/authenticated remain and this work does not resolve that separate exposure. The archived discovery proposal `20260826042410` is not a migration history gap. Release gate is now blocked only by the community proposal `20260826034331`: the current policies/helper appear equivalent, but the supported CLI repair was unavailable in this workspace. No history row was inserted manually, no merge or Vercel deployment occurred.

The community history gap was closed without fabricating the old version: forward migration `20261022102137_enforce_community_post_visibility` was applied via Supabase's supported migration tool. It reasserts the three current policies and removes the old broad policy names. The remote migration list now contains 84 rows; catalog verification confirmed all three policies still invoke `app_private.can_view_community`. The archived `20260826034331` SQL is marked superseded by this actual forward migration, not applied. Repository migration integrity and release gate now report zero pending forward migrations and zero unresolved historical reconciliations. This does not close the separate direct-table-grant or overall readiness findings.

## Current status — 2026-10-22, supersedes earlier gate snapshots

The latest recorded candidate CI is Quality run `39767772722` on `885909e64d23a6ebbc9882a744fad54aa6c54dd7`. It passed repository migration integrity, dependency audit, lint, typecheck, 113 tests, PostgreSQL discovery contract, production build, and evidence publication; Vercel Preview also passed. The repository gate reports zero pending forward migrations and zero unresolved historical reconciliations. The 45 legacy filename warnings remain informational. Earlier statements in this file that the repository gate was blocked by two forward migrations or historical reconciliation describe prior snapshots and are superseded by this result.

This CI result does not establish complete remote provenance or resolve the separate Supabase direct-SELECT exposure on `professionals`/`sport_spaces`, authenticated E2E, leaked-password protection, or privacy review. Production and `main` remain on `36ac94701c62175cd40c601e644edb2687c10ef1`; release readiness remains NO-GO. Do not infer release approval from repository integrity or Preview success.
## New verified forward migration — 2026-10-22 10:32 UTC

Applied through the Supabase migration tool: `20261022103139_revoke_public_event_participant_count`. The checked-in migration, baseline SHA-256 and provenance SQL now match the generated remote history row. Post-apply catalog check returned `has_function_privilege=false` for `anon` and `authenticated`, and `true` for `service_role`. The prior public participant-count advisory is cleared. `node scripts/check-migrations.mjs --release` passes locally with zero pending forward migrations and zero unresolved historical reconciliations; 45 legacy filenames remain warnings. CI for the updated commit is pending. This does not change the separate direct table grants or global 35/100 NO-GO readiness.
