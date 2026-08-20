-- Stage canonical enum labels in their own migration.
-- This repository historically started tracking migrations after the base schema
-- already existed remotely. Keep this legacy migration replay-safe on a clean DB;
-- the canonical baseline will own creation of public.user_role.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'user_role'
  ) THEN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'athlete';
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'venue_manager';
  END IF;
END
$$;
