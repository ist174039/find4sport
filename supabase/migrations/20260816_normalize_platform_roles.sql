BEGIN;

-- Canonical platform roles:
--   athlete | professional | venue_manager
-- Admins are intentionally excluded from platform_users and remain in admins.

UPDATE public.platform_users
SET type = CASE type::text
  WHEN 'athlete' THEN 'athlete'
  WHEN 'atleta' THEN 'athlete'
  WHEN 'user' THEN 'athlete'
  WHEN 'utilizador' THEN 'athlete'
  WHEN 'professional' THEN 'professional'
  WHEN 'profissional' THEN 'professional'
  WHEN 'venue_manager' THEN 'venue_manager'
  WHEN 'sport_space' THEN 'venue_manager'
  WHEN 'espaco' THEN 'venue_manager'
  WHEN 'gestor_espaco' THEN 'venue_manager'
  ELSE type::text
END
WHERE type IS NOT NULL;

-- Fail fast if unsupported values remain. Do not silently coerce unknown roles.
DO $$
DECLARE
  invalid_values text;
BEGIN
  SELECT string_agg(DISTINCT type::text, ', ' ORDER BY type::text)
  INTO invalid_values
  FROM public.platform_users
  WHERE type IS NOT NULL
    AND type::text NOT IN ('athlete', 'professional', 'venue_manager');

  IF invalid_values IS NOT NULL THEN
    RAISE EXCEPTION 'Unsupported platform_users.type values remain: %', invalid_values;
  END IF;
END
$$;

ALTER TABLE public.platform_users
  DROP CONSTRAINT IF EXISTS platform_users_type_check;

ALTER TABLE public.platform_users
  ADD CONSTRAINT platform_users_type_check
  CHECK (type::text IN ('athlete', 'professional', 'venue_manager'));

-- Keep Supabase auth metadata aligned for application-created users.
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{type}',
  to_jsonb(
    CASE raw_user_meta_data ->> 'type'
      WHEN 'athlete' THEN 'athlete'
      WHEN 'atleta' THEN 'athlete'
      WHEN 'user' THEN 'athlete'
      WHEN 'utilizador' THEN 'athlete'
      WHEN 'professional' THEN 'professional'
      WHEN 'profissional' THEN 'professional'
      WHEN 'venue_manager' THEN 'venue_manager'
      WHEN 'sport_space' THEN 'venue_manager'
      WHEN 'espaco' THEN 'venue_manager'
      WHEN 'gestor_espaco' THEN 'venue_manager'
      ELSE raw_user_meta_data ->> 'type'
    END
  ),
  true
)
WHERE raw_user_meta_data ? 'type'
  AND raw_user_meta_data ->> 'type' IN (
    'atleta', 'user', 'utilizador',
    'profissional',
    'sport_space', 'espaco', 'gestor_espaco'
  );

COMMIT;
