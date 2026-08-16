BEGIN;

CREATE OR REPLACE FUNCTION public.increment_feature_usage(
  p_user_id uuid,
  p_feature_key text,
  p_period_type text,
  p_period_start date,
  p_increment bigint DEFAULT 1
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count bigint;
BEGIN
  IF p_increment <= 0 THEN
    RAISE EXCEPTION 'increment must be positive';
  END IF;

  INSERT INTO public.feature_usage(user_id, feature_key, period_type, period_start, usage_count, updated_at)
  VALUES (p_user_id, p_feature_key, p_period_type, p_period_start, p_increment, now())
  ON CONFLICT (user_id, feature_key, period_type, period_start)
  DO UPDATE SET
    usage_count = public.feature_usage.usage_count + EXCLUDED.usage_count,
    updated_at = now()
  RETURNING usage_count INTO v_count;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_feature_usage(uuid,text,text,date,bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_feature_usage(uuid,text,text,date,bigint) TO service_role;

COMMIT;
