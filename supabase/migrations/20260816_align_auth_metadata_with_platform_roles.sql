BEGIN;

-- raw_user_meta_data is not an authorization source. Keep it aligned only for
-- presentation/registration context; platform_users.type remains authoritative.
UPDATE auth.users au
SET raw_user_meta_data = jsonb_set(
  COALESCE(au.raw_user_meta_data, '{}'::jsonb),
  '{type}',
  to_jsonb(pu.type::text),
  true
)
FROM public.platform_users pu
WHERE pu.id = au.id
  AND COALESCE(au.raw_user_meta_data->>'type', '') IS DISTINCT FROM pu.type::text;

COMMIT;
