-- Stage canonical enum labels in their own migration.
-- PostgreSQL requires newly added enum values to be committed before they are used
-- by subsequent UPDATE/ALTER statements.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'athlete';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'venue_manager';
