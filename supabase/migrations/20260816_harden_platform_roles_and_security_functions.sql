BEGIN;

-- Canonicalize the role enum itself. Legacy labels are no longer valid domain values.
ALTER TABLE public.platform_users ALTER COLUMN type DROP DEFAULT;
CREATE TYPE public.user_role_canonical AS ENUM ('athlete', 'professional', 'venue_manager');
ALTER TABLE public.platform_users
  ALTER COLUMN type TYPE public.user_role_canonical
  USING type::text::public.user_role_canonical;
DROP TYPE public.user_role;
ALTER TYPE public.user_role_canonical RENAME TO user_role;
ALTER TABLE public.platform_users
  ALTER COLUMN type SET DEFAULT 'athlete'::public.user_role;

-- Every newly created auth identity starts at the least-privileged platform role.
-- Professional / venue-manager elevation is performed only by protected server actions
-- after the corresponding domain profile has been created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.platform_users (id, full_name, avatar_url, type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    'athlete'::public.user_role
  );
  RETURN NEW;
END;
$$;

-- Administrative reporting RPCs must never accept arbitrary table names and must
-- never be callable anonymously. They also self-authorize against the admins table.
CREATE OR REPLACE FUNCTION public.get_weekly_registrations(
  weeks_back integer DEFAULT 8,
  table_name text DEFAULT 'platform_users'::text
)
RETURNS TABLE(period text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  query text;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'admin_required' USING ERRCODE = '42501';
  END IF;

  IF table_name NOT IN ('platform_users', 'professionals', 'sport_spaces', 'events', 'reservations') THEN
    RAISE EXCEPTION 'unsupported_table' USING ERRCODE = '22023';
  END IF;

  query := format(
    'SELECT to_char(date_trunc(''week'', created_at), ''IYYY-IW'') AS period, COUNT(*) AS count
     FROM public.%I
     WHERE created_at >= NOW() - ($1 * INTERVAL ''1 week'')
     GROUP BY period ORDER BY period',
    table_name
  );
  RETURN QUERY EXECUTE query USING weeks_back;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_monthly_registrations(
  months_back integer DEFAULT 6,
  table_name text DEFAULT 'platform_users'::text
)
RETURNS TABLE(period text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  query text;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'admin_required' USING ERRCODE = '42501';
  END IF;

  IF table_name NOT IN ('platform_users', 'professionals', 'sport_spaces', 'events', 'reservations') THEN
    RAISE EXCEPTION 'unsupported_table' USING ERRCODE = '22023';
  END IF;

  query := format(
    'SELECT to_char(date_trunc(''month'', created_at), ''YYYY-MM'') AS period, COUNT(*) AS count
     FROM public.%I
     WHERE created_at >= NOW() - ($1 * INTERVAL ''1 month'')
     GROUP BY period ORDER BY period',
    table_name
  );
  RETURN QUERY EXECUTE query USING months_back;
END;
$$;

-- Fixed search paths for application functions flagged by the database advisor.
ALTER FUNCTION public.handle_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_current_timestamp_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_review_stats() SET search_path = public, pg_temp;
ALTER FUNCTION public.is_admin_general() SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_professional_views(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_space_views(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.search_professionals_by_radius(double precision, double precision, double precision) SET search_path = public, pg_temp;
ALTER FUNCTION public.search_spaces_by_radius(double precision, double precision, double precision) SET search_path = public, pg_temp;

-- Trigger functions are not API endpoints.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_current_timestamp_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_review_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_current_timestamp_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_review_stats() TO service_role;

-- Admin reporting functions are server/admin-only.
REVOKE ALL ON FUNCTION public.get_weekly_registrations(integer, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_monthly_registrations(integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_registrations(integer, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_monthly_registrations(integer, text) TO service_role;

-- Admin helper is used by RLS for authenticated admins, never by anonymous users.
REVOKE ALL ON FUNCTION public.is_admin_general() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_general() TO authenticated, service_role;

COMMIT;
