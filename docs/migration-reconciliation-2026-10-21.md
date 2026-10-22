# Migration reconciliation — 2026-10-21

Project: `bqjwsllnhvnxrfojftjb`. Evidence source: read-only query of `supabase_migrations.schema_migrations`. The checked-in export contains all 81 version/name pairs and SQL for the 23 rows at or after the baseline cutoff. It is a dated snapshot; it does not prove the current production schema.

## Exact history restored

The seven local strict files that used versions different from same-name remote entries have been preserved under `supabase/reconciliation-proposals/`. Each is non-executable by the migration runner, and its SHA-256 plus disposition is recorded in that folder's manifest. The seven exact remote-version files now live under `supabase/migrations/`, with SQL copied byte-for-byte from the read-only provenance export. All 23 post-cutoff history entries are registered with matching names, checksums, and recorded SQL. The two additional historical files that had formatting drift were normalized to the exact recorded SQL as well.

These files restore repository provenance; they do not authorize replay. In particular, the local provider identity proposal included a backfill absent from the remote historical migration. That proposal remains archived and was not run. The recorded history includes the later `allow_multi_provider_capabilities` change, and the inspected current function matches that later athlete-only normalization; the current owner check found zero approved claims without a space owner.

## Two unresolved history rows

`20260826034331_harden_private_community_post_visibility` and `20260826042410_secure_public_discovery_contracts` were present in the earlier local baseline but have no matching row in the remote history snapshot. Their SQL files are archived outside the executable migration directory. Read-only catalog inspection found the expected community RLS behavior and discovery functions/grants in the observed state, but that does not establish which SQL bytes created them or prove the state has not changed since inspection.

The gate therefore treats these as explicit pending reconciliations and fails. Do not add them to the reconciled history, insert old rows manually, replay their archived SQL, or treat a new forward migration as proof of those old versions. To close this gap, an authorized database operator must verify the exact current catalog and either use Supabase's supported `migration repair --status applied` for the verified historical versions, or keep the exceptions documented and change the gate policy with an explicit evidence-based decision. Any actual drift requires a reviewed, forward-only migration tested in an isolated database.

## Validation and release status

`node scripts/check-migrations.mjs` now verifies both directions of the 23-row history snapshot, exact recorded SQL, checksums, archived proposal checksums, and explicit pending reconciliation records. The focused gate tests pass 8/8. The migration gate still fails on exactly the two unrecorded history cases; it also emits 45 warnings for legacy timestamp filenames, which are not gate blockers but still need inventory review.

On 2026-10-22 the authorized Supabase MCP connection re-read the remote migration list: the same two versions remain absent. A fresh read-only catalog query observed the community post/comment/like visibility policies and the expected discovery functions. Discovery functions use SECURITY INVOKER with restricted ACLs; the public participant aggregate remains SECURITY DEFINER with public-role execute grants and is a separate risk-register item. This query is point-in-time evidence, not history repair. The Supabase CLI 2.121.0 exposes the supported `migration repair --status applied` operation, but this workspace has no linked CLI config or access token, so no repair was run.

No production SQL was executed, no remote migration history was changed, and no deployment was made.

Release remains blocked until the two history exceptions are resolved through supported, reviewed evidence and the full CI/release gate passes on the candidate commit.
