BEGIN;

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  reservation_id UUID NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'stripe_webhook_events'
      AND policyname = 'No direct client access to stripe_webhook_events'
  ) THEN
    CREATE POLICY "No direct client access to stripe_webhook_events"
      ON public.stripe_webhook_events FOR ALL USING (false) WITH CHECK (false);
  END IF;
END
$$;

-- This repository originally adopted versioned migrations after the core schema
-- already existed remotely. Keep this legacy hardening migration replay-safe on
-- a clean CI database instead of assuming posts/platform_users/communities exist.
DO $$
BEGIN
  IF to_regclass('public.posts') IS NOT NULL
     AND to_regclass('public.platform_users') IS NOT NULL THEN
    ALTER TABLE public.posts
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.platform_users(id) ON DELETE SET NULL;
  END IF;

  IF to_regclass('public.posts') IS NOT NULL
     AND to_regclass('public.communities') IS NOT NULL THEN
    ALTER TABLE public.posts
      ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.post_likes') IS NOT NULL THEN
    DELETE FROM public.post_likes a USING public.post_likes b
    WHERE a.id > b.id AND a.post_id = b.post_id AND a.user_id = b.user_id;

    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public' AND indexname = 'post_likes_post_user_unique_idx'
    ) THEN
      CREATE UNIQUE INDEX post_likes_post_user_unique_idx ON public.post_likes(post_id, user_id);
    END IF;
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.platform_users') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'platform_users' AND column_name = 'type'
     ) THEN
    ALTER TABLE public.platform_users
      ADD CONSTRAINT platform_users_type_check
      CHECK (type::text IN ('athlete','atleta','user','professional','profissional','venue_manager','espaco','gestor_espaco','admin','moderator'));
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.admin_users') IS NULL
     AND to_regclass('public.admins') IS NOT NULL THEN
    CREATE OR REPLACE VIEW public.admin_users AS
    SELECT a.id, a.auth_user_id AS user_id, true::boolean AS is_active,
           a.admin_type AS role, a.created_at, a.created_at AS updated_at
    FROM public.admins a;
  END IF;
END
$$;

COMMIT;
