-- Keep public event history discoverable while allowing callers to hide past events.

DROP FUNCTION IF EXISTS public.discover_events(double precision,double precision,double precision,uuid[],text,text,timestamptz,timestamptz,numeric,numeric,text,integer,integer);

CREATE OR REPLACE FUNCTION public.discover_events(
  p_lat double precision DEFAULT null,
  p_lng double precision DEFAULT null,
  p_radius double precision DEFAULT null,
  p_category_ids uuid[] DEFAULT null,
  p_q text DEFAULT null,
  p_location text DEFAULT null,
  p_date_from timestamptz DEFAULT null,
  p_date_to timestamptz DEFAULT null,
  p_price_min numeric DEFAULT null,
  p_price_max numeric DEFAULT null,
  p_sort text DEFAULT 'upcoming',
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT 24,
  p_include_past boolean DEFAULT true
) RETURNS TABLE(item jsonb,total_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path=public
AS $$
  WITH base AS (
    SELECT
      e.*,
      CASE
        WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND e.latitude IS NOT NULL AND e.longitude IS NOT NULL
          THEN 6371*2*asin(sqrt(power(sin(radians(e.latitude-p_lat)/2),2)+cos(radians(p_lat))*cos(radians(e.latitude))*power(sin(radians(e.longitude-p_lng)/2),2)))
      END distance_km,
      CASE WHEN e.category_id IS NOT NULL THEN (SELECT to_jsonb(c) FROM public.categories c WHERE c.id=e.category_id) END category
    FROM public.events e
    WHERE e.status='published'
      AND (p_include_past OR e.start_date>=now())
      AND (p_category_ids IS NULL OR e.category_id=ANY(p_category_ids))
      AND (nullif(trim(p_q),'') IS NULL OR e.title ILIKE '%'||p_q||'%' OR coalesce(e.description,'') ILIKE '%'||p_q||'%' OR coalesce(e.address,'') ILIKE '%'||p_q||'%')
      AND (nullif(trim(p_location),'') IS NULL OR coalesce(e.address,'') ILIKE '%'||p_location||'%')
      AND (p_date_from IS NULL OR e.start_date>=p_date_from)
      AND (p_date_to IS NULL OR e.start_date<=p_date_to)
      AND (p_price_min IS NULL OR coalesce(e.price_min,0)>=p_price_min)
      AND (p_price_max IS NULL OR coalesce(e.price_min,0)<=p_price_max)
  ),
  filtered AS (
    SELECT * FROM base WHERE p_radius IS NULL OR distance_km<=p_radius
  ),
  ranked AS (
    SELECT *,count(*) OVER() cnt
    FROM filtered
    ORDER BY
      CASE WHEN p_sort='upcoming' THEN CASE WHEN start_date>=now() THEN 0 ELSE 1 END END ASC,
      CASE WHEN p_sort='upcoming' AND start_date>=now() THEN extract(epoch FROM start_date) END ASC,
      CASE WHEN p_sort='upcoming' AND start_date<now() THEN extract(epoch FROM start_date) END DESC,
      CASE WHEN p_sort='distance' THEN distance_km END ASC NULLS LAST,
      CASE WHEN p_sort='popular' THEN views_count END DESC NULLS LAST,
      CASE WHEN p_sort='newest' THEN extract(epoch FROM created_at) END DESC,
      CASE WHEN p_sort='price_asc' THEN price_min END ASC NULLS LAST,
      CASE WHEN p_sort='price_desc' THEN price_min END DESC NULLS LAST,
      start_date,
      id
    OFFSET greatest(p_offset,0)
    LIMIT least(greatest(p_limit,1),100)
  )
  SELECT
    to_jsonb(ranked)-'distance_km'-'category'-'cnt'||jsonb_build_object('distanceKm',distance_km,'category',category),
    cnt
  FROM ranked;
$$;

REVOKE ALL ON FUNCTION public.discover_events(double precision,double precision,double precision,uuid[],text,text,timestamptz,timestamptz,numeric,numeric,text,integer,integer,boolean) FROM public,anon,authenticated;
