-- P0 hardening: internal refund persistence must never be callable from the Data API.
REVOKE ALL ON FUNCTION public.persist_refund_transaction_from_webhook_event() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.persist_refund_transaction_from_webhook_event() FROM anon;
REVOKE ALL ON FUNCTION public.persist_refund_transaction_from_webhook_event() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.persist_refund_transaction_from_webhook_event() TO service_role;

-- Replace overlapping/legacy sport_spaces policies with one explicit contract:
-- public discovery = active only; authenticated creation = self-owned venue; owner/admin management only.
DROP POLICY IF EXISTS "Admins can manage all spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Admins can view all spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Authenticated users can create spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Authenticated users can insert spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Owners can view their spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Owners can update spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Owners can update their spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Public can view active spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Spaces are readable by everyone if active" ON public.sport_spaces;

CREATE POLICY "sport_spaces_public_read_active"
ON public.sport_spaces
FOR SELECT
TO anon, authenticated
USING (status = 'active'::public.space_status);

CREATE POLICY "sport_spaces_owner_read"
ON public.sport_spaces
FOR SELECT
TO authenticated
USING ((select auth.uid()) = owner_user_id OR (select auth.uid()) = created_by);

CREATE POLICY "sport_spaces_owner_insert"
ON public.sport_spaces
FOR INSERT
TO authenticated
WITH CHECK (
  (select auth.uid()) IS NOT NULL
  AND (select auth.uid()) = created_by
  AND (select auth.uid()) = owner_user_id
);

CREATE POLICY "sport_spaces_owner_update"
ON public.sport_spaces
FOR UPDATE
TO authenticated
USING ((select auth.uid()) = owner_user_id)
WITH CHECK ((select auth.uid()) = owner_user_id);

CREATE POLICY "sport_spaces_owner_delete"
ON public.sport_spaces
FOR DELETE
TO authenticated
USING ((select auth.uid()) = owner_user_id);

CREATE POLICY "sport_spaces_admin_manage"
ON public.sport_spaces
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.auth_user_id = (select auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.auth_user_id = (select auth.uid())));
