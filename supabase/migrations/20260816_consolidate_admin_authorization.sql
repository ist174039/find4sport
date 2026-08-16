BEGIN;

-- Admin authorization has a single source of truth: public.admins(auth_user_id).
-- Replace all legacy admin_users-based RLS policies with explicit authenticated policies.

DROP POLICY IF EXISTS "Allow admin write access to carousel_slides" ON public.carousel_slides;
CREATE POLICY "Admins can manage carousel slides"
ON public.carousel_slides
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.auth_user_id = (SELECT auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.auth_user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins can read all events" ON public.events;
CREATE POLICY "Admins can read all events"
ON public.events
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.auth_user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins can update all events" ON public.events;
CREATE POLICY "Admins can update all events"
ON public.events
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.auth_user_id = (SELECT auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.auth_user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Professionals are readable by everyone if active" ON public.professionals;
CREATE POLICY "Professionals are readable by everyone if active"
ON public.professionals
FOR SELECT
TO anon, authenticated
USING (
  status = 'active'::professional_status
  OR (SELECT auth.uid()) = user_id
  OR EXISTS (SELECT 1 FROM public.admins a WHERE a.auth_user_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Admins can update any professional" ON public.professionals;
CREATE POLICY "Owners and admins can update professionals"
ON public.professionals
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = user_id
  OR EXISTS (SELECT 1 FROM public.admins a WHERE a.auth_user_id = (SELECT auth.uid()))
)
WITH CHECK (
  (SELECT auth.uid()) = user_id
  OR EXISTS (SELECT 1 FROM public.admins a WHERE a.auth_user_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Admins can do everything on system_config" ON public.system_config;
CREATE POLICY "Admins can manage system config"
ON public.system_config
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.auth_user_id = (SELECT auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.auth_user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins can read own profile" ON public.admins;
CREATE POLICY "Admins can read own profile"
ON public.admins
FOR SELECT
TO authenticated
USING (auth_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "General admins can read all admins" ON public.admins;
CREATE POLICY "General admins can read all admins"
ON public.admins
FOR SELECT
TO authenticated
USING (public.is_admin_general());

DROP TABLE public.admin_users;

COMMIT;
