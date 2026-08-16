BEGIN;

ALTER FUNCTION public.search_professionals_by_radius(double precision, double precision, double precision) SECURITY INVOKER;
ALTER FUNCTION public.search_spaces_by_radius(double precision, double precision, double precision) SECURITY INVOKER;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_admin_general()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE auth_user_id = (SELECT auth.uid())
      AND admin_type = 'general'
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin_general() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin_general() TO authenticated, service_role;

DROP POLICY IF EXISTS "General admins can read all admins" ON public.admins;
CREATE POLICY "General admins can read all admins"
ON public.admins
FOR SELECT
TO authenticated
USING (private.is_admin_general());

DROP FUNCTION public.is_admin_general();

COMMIT;
