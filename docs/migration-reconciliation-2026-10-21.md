# Migration reconciliation — read-only evidence, 2026-10-21

Project: `bqjwsllnhvnxrfojftjb`. Source: `supabase_migrations.schema_migrations`, queried read-only. Task: [V02](https://app.notion.com/p/400be9392b6081da87e9df7871e9a674).

The export in `supabase/migration-provenance.json` preserves all 81 version/name pairs and recorded SQL for the 23 entries at or after the baseline cutoff. This is a dated snapshot, not a live database assertion. Recorded SQL is history evidence; subsequent migrations can replace the same functions or policies.

## Recovered files

Two previously missing files now contain the recorded remote SQL under the exact remote version/name. They have baseline checksums and recorded-SQL verification:

- `20260826043325_add_public_event_participant_count.sql` defines the existing public aggregate RPC; no new database privilege or function was applied.
- `20260827030638_allow_multi_provider_capabilities.sql` supersedes the earlier provider function. The current function was independently read and matches its athlete-only role normalization. Current ACL grants execution to postgres/service_role, with triggers on professionals.user_id and sport_spaces.owner_user_id.

Restoring these historical files does not authorize their replay.

## Outstanding differences

Seven local strict files still use versions different from same-name recorded remote entries. Five are equivalent after formatting review; `add_editable_event_manager_plan` additionally uses different aliases/comments. The provider identity migration has a material difference:

- Remote `20260827030544_fix_provider_identity_role_variable` initially rejects cross-provider role assignments and normalizes other roles.
- Remote `20260827030638_allow_multi_provider_capabilities` replaces this with athlete-only role normalization. Ignoring this later entry would give an incorrect picture of current authorization.
- Local `20260827000001_fix_provider_identity_role_variable.sql` combines the latter function behavior with an approved-claim backfill absent from the earlier recorded SQL. The read-only count of approved claims with no space owner is zero as of this snapshot. This does not prove the backfill was historically applied.

Two existing baseline entries have no matching remote history record: `20260826034331_harden_private_community_post_visibility` and `20260826042410_secure_public_discovery_contracts`. They must not be called applied solely because they were already listed in the baseline. Their policies, grants, views and functions require read-only inspection, followed by a reviewed forward migration if needed.

## Gate and next step

`node scripts/check-migrations.mjs` now checks both directions of the captured history as well as checksums/recorded SQL for the recovered files. It deliberately fails on outstanding differences. No production SQL was executed, no migration history was rewritten, and no local historical files were renamed or replayed.

To close V02: review the complete legacy inventory, inspect the two unrecorded hardening changes against actual schema/ACL state, preserve the original local provider backfill as an explicitly reviewed proposal, and prepare a reconciliation that retains exact deployed SQL and any necessary forward changes. Then validate in an isolated database and refresh remote evidence before release. Do not turn a dated history export into a production-readiness assertion.
