BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.platform_users (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE IF EXISTS public.user_profiles RENAME COLUMN role TO type;
ALTER TABLE IF EXISTS public.user_profiles RENAME TO platform_users;

CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    admin_type TEXT NOT NULL CHECK (admin_type IN ('general', 'operacional')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own profile" ON public.admins FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "General admins can read all admins" ON public.admins FOR SELECT USING (
    (SELECT admin_type FROM public.admins WHERE auth_user_id = auth.uid()) = 'general'
);

INSERT INTO public.admins (auth_user_id, email, admin_type)
SELECT id, COALESCE((SELECT email FROM auth.users WHERE auth.users.id = platform_users.id), 'admin@find4sport.pt'), 'general'
FROM public.platform_users
WHERE type::text IN ('admin', 'moderator');

DELETE FROM public.platform_users WHERE type::text IN ('admin', 'moderator');

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'gestor_espaco';

COMMIT;
