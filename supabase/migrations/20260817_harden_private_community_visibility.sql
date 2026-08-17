BEGIN;

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO anon, authenticated;

CREATE OR REPLACE FUNCTION app_private.can_view_community(target_community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.communities c
    WHERE c.id = target_community_id
      AND (
        NOT COALESCE(c.is_private, false)
        OR c.created_by = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1
          FROM public.community_members cm
          WHERE cm.community_id = c.id
            AND cm.user_id = (SELECT auth.uid())
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION app_private.can_view_community(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.can_view_community(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Communities are viewable by everyone." ON public.communities;
DROP POLICY IF EXISTS "Community members are viewable by everyone." ON public.community_members;

DROP POLICY IF EXISTS "Communities visible by privacy" ON public.communities;
CREATE POLICY "Communities visible by privacy"
ON public.communities
FOR SELECT
TO anon, authenticated
USING (app_private.can_view_community(id));

DROP POLICY IF EXISTS "Community members visible by community privacy" ON public.community_members;
CREATE POLICY "Community members visible by community privacy"
ON public.community_members
FOR SELECT
TO anon, authenticated
USING (app_private.can_view_community(community_id));

COMMIT;
