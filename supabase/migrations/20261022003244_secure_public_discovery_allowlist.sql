-- Replace discovery functions that serialized entire table rows. Keep the
-- public contract explicit and execute with the owner role, since direct
-- table SELECT is intentionally broader today and is tracked for follow-up.
-- Product decision: hide owned spaces while their owner is blocked or suspended.

create or replace function public.discover_professionals(
  p_lat double precision default null, p_lng double precision default null,
  p_radius double precision default null, p_category_ids uuid[] default null,
  p_q text default null, p_location text default null, p_rating numeric default null,
  p_price_min numeric default null, p_price_max numeric default null,
  p_sort text default 'relevance', p_offset integer default 0, p_limit integer default 24
) returns table(item jsonb,total_count bigint)
language sql stable security invoker set search_path=pg_catalog,public as $$
with base as (
 select p.id,p.full_name,p.professional_name,p.bio,p.avatar_url,p.address,p.latitude,p.longitude,
  p.status,p.public_slug,p.rating_avg,p.review_count,p.views_count,p.is_verified,p.is_premium,
  p.gallery_urls,p.created_at,
  (select avg(s.price) from public.services s where s.professional_id=p.id and s.is_active=true) avg_price,
  case when p_lat is not null and p_lng is not null and p.latitude is not null and p.longitude is not null
   then 6371*2*asin(sqrt(power(sin(radians(p.latitude-p_lat)/2),2)+cos(radians(p_lat))*cos(radians(p.latitude))*power(sin(radians(p.longitude-p_lng)/2),2))) end distance_km,
  coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'slug',c.slug,'parent_id',c.parent_id,'icon_key',c.icon_key) order by c.name)
   from public.professional_categories pc join public.categories c on c.id=pc.category_id
   where pc.professional_id=p.id and c.is_active=true),'[]'::jsonb) categories
 from public.professionals p where p.status='active'
  and exists (
   select 1 from public.platform_users pu where pu.id=p.user_id
    and (pu.account_status='active' or (pu.account_status='suspended' and pu.suspended_until<=now()))
  )
  and (p_category_ids is null or exists(select 1 from public.professional_categories pc where pc.professional_id=p.id and pc.category_id=any(p_category_ids)))
  and (nullif(trim(left(coalesce(p_q,''),120)),'') is null or p.full_name ilike '%'||left(coalesce(p_q,''),120)||'%' or coalesce(p.professional_name,'') ilike '%'||left(coalesce(p_q,''),120)||'%' or coalesce(p.bio,'') ilike '%'||left(coalesce(p_q,''),120)||'%')
  and (nullif(trim(left(coalesce(p_location,''),120)),'') is null or coalesce(p.address,'') ilike '%'||left(coalesce(p_location,''),120)||'%')
  and (p_rating is null or coalesce(p.rating_avg,0)>=p_rating)
), filtered as (
 select * from base where (p_radius is null or distance_km<=p_radius)
  and (p_price_min is null or avg_price>=p_price_min) and (p_price_max is null or avg_price<=p_price_max)
), ranked as (
 select *,count(*) over() cnt from filtered order by
  case when p_sort='rating' then rating_avg end desc nulls last,
  case when p_sort='reviews' then review_count end desc nulls last,
  case when p_sort='newest' then extract(epoch from created_at) end desc nulls last,
  case when p_sort='price_asc' then avg_price end asc nulls last,
  case when p_sort='price_desc' then avg_price end desc nulls last,
  case when p_sort in ('distance','relevance') and p_lat is not null then distance_km end asc nulls last,
  case when p_sort='relevance' and p_lat is null then rating_avg end desc nulls last,id
 offset least(greatest(p_offset,0),10000) limit least(greatest(p_limit,1),100)
)
select jsonb_build_object('id',id,'full_name',full_name,'professional_name',professional_name,'bio',bio,
 'avatar_url',avatar_url,'address',address,'latitude',latitude,'longitude',longitude,'status',status,
 'public_slug',public_slug,'rating_avg',rating_avg,'review_count',review_count,'views_count',views_count,
 'is_verified',is_verified,'is_premium',is_premium,'gallery_urls',gallery_urls,'created_at',created_at,
 'averagePrice',avg_price,'distanceKm',distance_km,'categories',categories),cnt from ranked;
$$;

create or replace function public.discover_spaces(
  p_lat double precision default null, p_lng double precision default null,
  p_radius double precision default null, p_category_ids uuid[] default null,
  p_q text default null, p_location text default null, p_rating numeric default null,
  p_price_min numeric default null, p_price_max numeric default null,
  p_sort text default 'relevance', p_offset integer default 0, p_limit integer default 24
) returns table(item jsonb,total_count bigint)
language sql stable security invoker set search_path=pg_catalog,public as $$
with base as (
 select s.id,s.name,s.slug,s.description,s.address,s.latitude,s.longitude,s.status,s.is_verified,
  s.rating_avg,s.review_count,s.gallery_urls,s.cover_url,s.created_at,
  (select avg(r.price_per_hour) from public.space_rooms r where r.space_id=s.id and r.is_active=true) avg_price,
  case when p_lat is not null and p_lng is not null and s.latitude is not null and s.longitude is not null
   then 6371*2*asin(sqrt(power(sin(radians(s.latitude-p_lat)/2),2)+cos(radians(p_lat))*cos(radians(s.latitude))*power(sin(radians(s.longitude-p_lng)/2),2))) end distance_km,
  coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'slug',c.slug,'parent_id',c.parent_id,'icon_key',c.icon_key) order by c.name)
   from public.space_categories sc join public.categories c on c.id=sc.category_id
   where sc.space_id=s.id and c.is_active=true),'[]'::jsonb) categories
 from public.sport_spaces s where s.status='active'
  and s.owner_user_id is not null and exists (
   select 1 from public.platform_users pu where pu.id=s.owner_user_id
    and (pu.account_status='active' or (pu.account_status='suspended' and pu.suspended_until<=now()))
  )
  and (p_category_ids is null or exists(select 1 from public.space_categories sc where sc.space_id=s.id and sc.category_id=any(p_category_ids)))
  and (nullif(trim(left(coalesce(p_q,''),120)),'') is null or s.name ilike '%'||left(coalesce(p_q,''),120)||'%' or coalesce(s.description,'') ilike '%'||left(coalesce(p_q,''),120)||'%' or coalesce(s.address,'') ilike '%'||left(coalesce(p_q,''),120)||'%')
  and (nullif(trim(left(coalesce(p_location,''),120)),'') is null or coalesce(s.address,'') ilike '%'||left(coalesce(p_location,''),120)||'%')
  and (p_rating is null or coalesce(s.rating_avg,0)>=p_rating)
), filtered as (
 select * from base where (p_radius is null or distance_km<=p_radius)
  and (p_price_min is null or avg_price>=p_price_min) and (p_price_max is null or avg_price<=p_price_max)
), ranked as (
 select *,count(*) over() cnt from filtered order by
  case when p_sort='rating' then rating_avg end desc nulls last,
  case when p_sort='reviews' then review_count end desc nulls last,
  case when p_sort='newest' then extract(epoch from created_at) end desc nulls last,
  case when p_sort='price_asc' then avg_price end asc nulls last,
  case when p_sort='price_desc' then avg_price end desc nulls last,
  case when p_sort in ('distance','relevance') and p_lat is not null then distance_km end asc nulls last,
  case when p_sort='relevance' and p_lat is null then rating_avg end desc nulls last,id
 offset least(greatest(p_offset,0),10000) limit least(greatest(p_limit,1),100)
)
select jsonb_build_object('id',id,'name',name,'slug',slug,'description',description,'address',address,
 'latitude',latitude,'longitude',longitude,'status',status,'is_verified',is_verified,'rating_avg',rating_avg,
 'review_count',review_count,'gallery_urls',gallery_urls,'cover_url',cover_url,'created_at',created_at,
 'averagePrice',avg_price,'distanceKm',distance_km,'categories',categories),cnt from ranked;
$$;

revoke all on function public.discover_professionals(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer) from public;
grant execute on function public.discover_professionals(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer) to anon,authenticated;
revoke all on function public.discover_spaces(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer) from public;
grant execute on function public.discover_spaces(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer) to anon,authenticated;
