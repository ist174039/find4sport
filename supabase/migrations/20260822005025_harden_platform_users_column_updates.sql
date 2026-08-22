-- Reconciled with production migration 20260822005025_harden_platform_users_column_updates.
-- Restrict authenticated clients to the profile fields they are allowed to mutate.
-- Privileged fields such as type, id, created_at and updated_at remain server-managed.

REVOKE UPDATE ON TABLE public.platform_users FROM authenticated;

GRANT UPDATE (
  full_name,
  avatar_url,
  banner_url,
  location,
  language,
  preferences
) ON TABLE public.platform_users TO authenticated;
