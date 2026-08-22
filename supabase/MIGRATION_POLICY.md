# Supabase Migration Policy

## Source of truth

Every database schema or privilege change must be represented by a SQL migration in `supabase/migrations` before it is considered complete.

New migrations must use the exact timestamped format:

`YYYYMMDDHHMMSS_snake_case_name.sql`

The timestamp and name must match the migration applied to Supabase.

## Production rule

Do not make unversioned DDL changes directly in production. The required sequence is:

1. Create the timestamped SQL migration in Git.
2. Review the migration for destructive operations and rollback implications.
3. Apply the same migration to Supabase.
4. Verify the resulting schema/security state.
5. Run quality and critical E2E checks before considering the change complete.

## Legacy reconciliation

The repository contains historical migrations whose filenames predate the exact timestamp convention. Do not rename or replay those files blindly: production already contains corresponding schema changes under timestamped Supabase migration-history entries.

Legacy migrations must be reconciled by mapping production migration version/name to the existing Git file or to a reconciliation migration when the Git source is genuinely missing.

## Safety

Never replay an already-applied production migration solely to align filenames. Never delete or squash production migration history. Destructive DDL requires an explicit data-preservation and rollback plan.

## Baseline

`20260822005025_harden_platform_users_column_updates.sql` is the first production migration reconciled under this policy. All subsequent production migrations must follow the exact timestamp convention.
