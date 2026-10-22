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

When a local historical filename or SQL differs from the recorded production history, preserve the local proposal outside `supabase/migrations` and restore the exact recorded version, name, and SQL as the executable historical file. Do not replay the restored file. When observed live catalog state has no matching history row, keep it explicitly pending; never insert a historical row manually or claim that a new forward migration proves an older version. Resolve the gap only with a supported Supabase history-repair operation after exact catalog verification, or with a documented policy exception. Any drift must be handled by a new, reviewed forward migration and validated in an isolated database.

## Safety

Never replay an already-applied production migration solely to align filenames. Never delete or squash production migration history. Destructive DDL requires an explicit data-preservation and rollback plan.

## Baseline

`20260822005025_harden_platform_users_column_updates.sql` is the first production migration reconciled under this policy. All subsequent production migrations must follow the exact timestamp convention.
