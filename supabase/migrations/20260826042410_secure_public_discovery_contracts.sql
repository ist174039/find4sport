-- Public discovery functions must respect the caller's RLS context and return
-- only the fields required by public cards/search.

create or replace function public.discover_professionals(
  p_lat double precision default null, p_lng double precision default null,
  p_radius double precision default null, p_category_ids uuid[] default null,
  p_q text default null, p_location text default null, p_rating numeric default null,
  p_price_min numeric default null, p_price_max numeric default null,
  p_sort text default 'relevance', p_offset integer default 0, p_limit integer default 24
) returns table(item jsonb, total_count bigint)
language sql stable security invoker set search_path='public' as $$
with base as (
  select p.id,p.user_id,p.full_name,p.professional_name,p.bio,p.avatar_url,p.address,
    p.latitude,p.longitude,p.status,p.public_slug,p.rating_avg,p.review_count,p.views_count,
    p.is_verified,p.is_premium,p.gallery_urls,p.created_at,
    (select avg(s.price) from public.services s where s.professional_id=p.id and s.is_active=true) avg_price,
    case when p_lat is not null and p_lng is not null and p.latitude is not null and p.longitude is not null
      then 6371*2*asin(sqrt(power(sin(radians(p.latitude-p_lat)/2),2)+cos(radians(p_lat))*cos(radians(p.latitude))*power(sin(radians(p.longitude-p_lng)/2),2))) end distance_km,
    coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'slug',c.slug,'parent_id',c.parent_id,'icon_key',c.icon_key) order by c.name)
      from public.professional_categories pc join public.categories c on c.id=pc.category_id
      where pc.professional_id=p.id and c.is_active=true),'[]'::jsonb) categories
  from public.professionals p where p.status='active'
    and (p_category_ids is null or exists(select 1 from public.professional_categories pc where pc.professional_id=p.id and pc.category_id=any(p_category_ids)))
    and (nullif(trim(p_q),'') is null or p.full_name ilike '%'||p_q||'%' or coalesce(p.professional_name,'') ilike '%'||p_q||'%' or coalesce(p.bio,'') ilike '%'||p_q||'%')
    and (nullif(trim(p_location),'') is null or coalesce(p.address,'') ilike '%'||p_location||'%')
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
  offset greatest(p_offset,0) limit least(greatest(p_limit,1),100)
)
select jsonb_build_object('id',id,'user_id',user_id,'full_name',full_name,'professional_name',professional_name,
  'bio',bio,'avatar_url',avatar_url,'address',address,'latitude',latitude,'longitude',longitude,'status',status,
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
) returns table(item jsonb, total_count bigint)
language sql stable security invoker set search_path='public' as $$
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
    and (p_category_ids is null or exists(select 1 from public.space_categories sc where sc.space_id=s.id and sc.category_id=any(p_category_ids)))
    and (nullif(trim(p_q),'') is null or s.name ilike '%'||p_q||'%' or coalesce(s.description,'') ilike '%'||p_q||'%' or coalesce(s.address,'') ilike '%'||p_q||'%')
    and (nullif(trim(p_location),'') is null or coalesce(s.address,'') ilike '%'||p_location||'%')
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
  offset greatest(p_offset,0) limit least(greatest(p_limit,1),100)
)
select jsonb_build_object('id',id,'name',name,'slug',slug,'description',description,'address',address,
  'latitude',latitude,'longitude',longitude,'status',status,'is_verified',is_verified,'rating_avg',rating_avg,
  'review_count',review_count,'gallery_urls',gallery_urls,'cover_url',cover_url,
  'created_at',created_at,'averagePrice',avg_price,'distanceKm',distance_km,'categories',categories),cnt from ranked;
$$;

create or replace function public.discover_events(
  p_lat double precision default null, p_lng double precision default null,
  p_radius double precision default null, p_category_ids uuid[] default null,
  p_q text default null, p_location text default null, p_date_from timestamptz default null,
  p_date_to timestamptz default null, p_price_min numeric default null, p_price_max numeric default null,
  p_sort text default 'upcoming', p_offset integer default 0, p_limit integer default 24,
  p_include_past boolean default true
) returns table(item jsonb, total_count bigint)
language sql stable security invoker set search_path='public' as $$
with base as (
  select e.id,e.title,e.slug,e.description,e.category_id,e.address,e.latitude,e.longitude,e.start_date,e.end_date,
    e.capacity,e.price_min,e.price_max,e.image_url,e.gallery_urls,e.status,e.is_featured,e.is_verified,e.views_count,e.created_at,
    case when p_lat is not null and p_lng is not null and e.latitude is not null and e.longitude is not null
      then 6371*2*asin(sqrt(power(sin(radians(e.latitude-p_lat)/2),2)+cos(radians(p_lat))*cos(radians(e.latitude))*power(sin(radians(e.longitude-p_lng)/2),2))) end distance_km,
    case when e.category_id is not null then (select jsonb_build_object('id',c.id,'name',c.name,'slug',c.slug,'parent_id',c.parent_id,'icon_key',c.icon_key) from public.categories c where c.id=e.category_id and c.is_active=true) end category
  from public.events e where e.status='published' and (p_include_past or e.start_date>=now())
    and (p_category_ids is null or e.category_id=any(p_category_ids))
    and (nullif(trim(p_q),'') is null or e.title ilike '%'||p_q||'%' or coalesce(e.description,'') ilike '%'||p_q||'%' or coalesce(e.address,'') ilike '%'||p_q||'%')
    and (nullif(trim(p_location),'') is null or coalesce(e.address,'') ilike '%'||p_location||'%')
    and (p_date_from is null or e.start_date>=p_date_from) and (p_date_to is null or e.start_date<=p_date_to)
    and (p_price_min is null or coalesce(e.price_min,0)>=p_price_min) and (p_price_max is null or coalesce(e.price_min,0)<=p_price_max)
), filtered as (select * from base where p_radius is null or distance_km<=p_radius),
ranked as (
  select *,count(*) over() cnt from filtered order by
    case when p_sort='upcoming' then case when start_date>=now() then 0 else 1 end end,
    case when p_sort='upcoming' and start_date>=now() then extract(epoch from start_date) end,
    case when p_sort='upcoming' and start_date<now() then extract(epoch from start_date) end desc,
    case when p_sort='distance' then distance_km end asc nulls last,
    case when p_sort='popular' then views_count end desc nulls last,
    case when p_sort='newest' then extract(epoch from created_at) end desc,
    case when p_sort='price_asc' then price_min end asc nulls last,
    case when p_sort='price_desc' then price_min end desc nulls last,start_date,id
  offset greatest(p_offset,0) limit least(greatest(p_limit,1),100)
)
select jsonb_build_object('id',id,'title',title,'slug',slug,'description',description,'category_id',category_id,
  'address',address,'latitude',latitude,'longitude',longitude,'start_date',start_date,'end_date',end_date,
  'capacity',capacity,'price_min',price_min,'price_max',price_max,'image_url',image_url,'gallery_urls',gallery_urls,
  'status',status,'is_featured',is_featured,'is_verified',is_verified,'views_count',views_count,'created_at',created_at,
  'distanceKm',distance_km,'category',category),cnt from ranked;
$$;

create or replace function public.discover_communities(
  p_lat double precision default null, p_lng double precision default null,
  p_category_ids uuid[] default null, p_q text default null, p_sort text default 'newest',
  p_offset integer default 0, p_limit integer default 24
) returns table(item jsonb, total_count bigint)
language sql stable security invoker set search_path='public' as $$
with base as (
  select c.id,c.name,c.slug,c.description,c.cover_url,c.is_private,c.sport_category,c.created_at,
    c.location_scope,c.address,c.latitude,c.longitude,
    (select count(*) from public.community_members cm where cm.community_id=c.id) member_count,
    case when p_lat is not null and p_lng is not null and c.latitude is not null and c.longitude is not null
      then 6371*2*asin(sqrt(power(sin(radians(c.latitude-p_lat)/2),2)+cos(radians(p_lat))*cos(radians(c.latitude))*power(sin(radians(c.longitude-p_lng)/2),2))) end distance_km,
    coalesce((select jsonb_agg(jsonb_build_object('id',cat.id,'name',cat.name,'slug',cat.slug,'parent_id',cat.parent_id,'icon_key',cat.icon_key) order by cat.name)
      from public.community_categories cc join public.categories cat on cat.id=cc.category_id
      where cc.community_id=c.id and cat.is_active=true),'[]'::jsonb) categories
  from public.communities c
  where (p_category_ids is null or exists(select 1 from public.community_categories cc where cc.community_id=c.id and cc.category_id=any(p_category_ids)))
    and (nullif(trim(p_q),'') is null or c.name ilike '%'||p_q||'%' or coalesce(c.description,'') ilike '%'||p_q||'%' or coalesce(c.address,'') ilike '%'||p_q||'%')
), ranked as (
  select *,count(*) over() cnt from base order by
    case when p_sort='members' then member_count end desc,
    case when p_sort='name' then name end,
    case when p_sort='distance' then distance_km end asc nulls last,
    case when p_sort='newest' then extract(epoch from created_at) end desc,created_at desc,id
  offset greatest(p_offset,0) limit least(greatest(p_limit,1),100)
)
select jsonb_build_object('id',id,'name',name,'slug',slug,'description',description,'cover_url',cover_url,
  'is_private',is_private,'sport_category',sport_category,'created_at',created_at,'location_scope',location_scope,
  'address',address,'latitude',latitude,'longitude',longitude,'memberCount',member_count,
  'distanceKm',distance_km,'categories',categories),cnt from ranked;
$$;

revoke all on function public.discover_professionals(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer) from public;
grant execute on function public.discover_professionals(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer) to anon,authenticated;
revoke all on function public.discover_spaces(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer) from public;
grant execute on function public.discover_spaces(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer) to anon,authenticated;
revoke all on function public.discover_events(double precision,double precision,double precision,uuid[],text,text,timestamptz,timestamptz,numeric,numeric,text,integer,integer,boolean) from public;
grant execute on function public.discover_events(double precision,double precision,double precision,uuid[],text,text,timestamptz,timestamptz,numeric,numeric,text,integer,integer,boolean) to anon,authenticated;
revoke all on function public.discover_communities(double precision,double precision,uuid[],text,text,integer,integer) from public;
grant execute on function public.discover_communities(double precision,double precision,uuid[],text,text,integer,integer) to anon,authenticated;

create or replace function public.search_public_entities(
  p_q text default null, p_entity_type text default 'todos', p_category_ids uuid[] default null,
  p_location text default null, p_rating numeric default null, p_lat double precision default null,
  p_lng double precision default null, p_radius double precision default null,
  p_date_from timestamptz default null, p_date_to timestamptz default null,
  p_sort text default 'relevance', p_offset integer default 0, p_limit integer default 24
) returns table(item jsonb, total_count bigint)
language sql stable security invoker set search_path='public' as $$
with candidates as (
  select 'professional'::text item_type,p.id,p.professional_name title_alt,p.full_name title,
    p.bio subtitle,p.address,p.address map_address,p.rating_avg,p.review_count,p.is_verified,
    p.avatar_url image_url,'/profissionais/'||coalesce(p.public_slug,p.id::text) link,p.created_at,null::timestamptz start_date,
    p.latitude,p.longitude,
    (select avg(s.price) from public.services s where s.professional_id=p.id and s.is_active=true) average_price,
    null::numeric price_min,null::bigint member_count
  from public.professionals p where p.status='active'
    and p_entity_type in ('todos','profissionais')
    and (p_category_ids is null or exists(select 1 from public.professional_categories pc where pc.professional_id=p.id and pc.category_id=any(p_category_ids)))
  union all
  select 'space',s.id,null,s.name,s.description,s.address,s.address,s.rating_avg,s.review_count,s.is_verified,
    coalesce(s.cover_url,s.gallery_urls[1]),'/espacos/'||coalesce(s.slug,s.id::text),s.created_at,null,
    s.latitude,s.longitude,(select avg(r.price_per_hour) from public.space_rooms r where r.space_id=s.id and r.is_active=true),
    null,null
  from public.sport_spaces s where s.status='active'
    and p_entity_type in ('todos','espacos')
    and (p_category_ids is null or exists(select 1 from public.space_categories sc where sc.space_id=s.id and sc.category_id=any(p_category_ids)))
  union all
  select 'event',e.id,null,e.title,e.description,e.address,e.address,null,null,e.is_verified,e.image_url,
    '/eventos/'||coalesce(e.slug,e.id::text),e.created_at,e.start_date,e.latitude,e.longitude,null,e.price_min,null
  from public.events e where e.status='published' and e.start_date>=now()
    and p_entity_type in ('todos','eventos')
    and (p_category_ids is null or e.category_id=any(p_category_ids))
    and (p_date_from is null or e.start_date>=p_date_from) and (p_date_to is null or e.start_date<=p_date_to)
  union all
  select 'community',c.id,null,c.name,c.description,
    case when c.location_scope='online' then 'Online' else coalesce(c.address,'') end,
    case when c.location_scope='online' then null else c.address end,null,null,false,c.cover_url,
    '/comunidades/'||coalesce(c.slug,c.id::text),c.created_at,null,
    case when c.location_scope='online' then null else c.latitude end,
    case when c.location_scope='online' then null else c.longitude end,null,null,
    (select count(*) from public.community_members cm where cm.community_id=c.id)
  from public.communities c where p_entity_type in ('todos','comunidades')
    and (p_category_ids is null or exists(select 1 from public.community_categories cc where cc.community_id=c.id and cc.category_id=any(p_category_ids)))
), scored as (
  select *,
    coalesce(title_alt,title,'') display_title,
    case when p_lat is not null and p_lng is not null and latitude is not null and longitude is not null
      then 6371*2*asin(sqrt(power(sin(radians(latitude-p_lat)/2),2)+cos(radians(p_lat))*cos(radians(latitude))*power(sin(radians(longitude-p_lng)/2),2))) end distance_km,
    case when nullif(trim(p_q),'') is null then 0
      when lower(coalesce(title_alt,title,''))=lower(p_q) then 3
      when lower(coalesce(title_alt,title,'')) like lower(p_q)||'%' then 2
      when lower(coalesce(title_alt,title,'')) like '%'||lower(p_q)||'%' then 1
      else 0 end text_rank
  from candidates
  where (nullif(trim(p_q),'') is null or coalesce(title_alt,title,'') ilike '%'||p_q||'%' or coalesce(subtitle,'') ilike '%'||p_q||'%' or coalesce(address,'') ilike '%'||p_q||'%')
    and (nullif(trim(p_location),'') is null or coalesce(address,'') ilike '%'||p_location||'%')
    and (p_rating is null or item_type not in ('professional','space') or coalesce(rating_avg,0)>=p_rating)
), filtered as (
  select * from scored where p_radius is null or distance_km<=p_radius
), ranked as (
  select *,count(*) over() cnt from filtered order by
    case when p_sort='rating' then rating_avg end desc nulls last,
    case when p_sort='newest' then coalesce(start_date,created_at) end desc nulls last,
    case when p_sort='relevance' then text_rank end desc,
    case when p_sort='relevance' and p_lat is not null then distance_km end asc nulls last,
    case when p_sort='relevance' then rating_avg end desc nulls last,
    item_type,id
  offset greatest(p_offset,0) limit least(greatest(p_limit,1),48)
)
select jsonb_build_object('id',item_type||'-'||id::text,'itemType',item_type,'title',display_title,
  'subtitle',coalesce(subtitle,case when item_type='professional' then 'Profissional de desporto' when item_type='space' then 'Espaço desportivo' when item_type='event' then 'Evento desportivo' else 'Comunidade desportiva' end),
  'address',coalesce(address,''),'mapAddress',map_address,'rating_avg',rating_avg,'review_count',review_count,
  'is_verified',coalesce(is_verified,false),'image_url',image_url,'link',link,'created_at',created_at,
  'start_date',start_date,'latitude',latitude,'longitude',longitude,'distanceKm',distance_km,
  'averagePrice',average_price,'price_min',price_min,'memberCount',member_count),cnt
from ranked;
$$;

revoke all on function public.search_public_entities(text,text,uuid[],text,numeric,double precision,double precision,double precision,timestamptz,timestamptz,text,integer,integer) from public;
grant execute on function public.search_public_entities(text,text,uuid[],text,numeric,double precision,double precision,double precision,timestamptz,timestamptz,text,integer,integer) to anon,authenticated;

-- Expose only an aggregate for public event capacity. Direct participant rows
-- remain protected by RLS and cannot be enumerated from public pages.
create or replace function public.public_event_participant_count(p_event_id uuid)
returns bigint
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select count(*)
  from public.event_participants ep
  where ep.event_id = p_event_id
    and ep.status in ('confirmed', 'paid')
    and exists (
      select 1
      from public.events e
      where e.id = ep.event_id
        and e.status in ('published', 'completed')
    );
$$;

revoke all on function public.public_event_participant_count(uuid) from public;
grant execute on function public.public_event_participant_count(uuid) to anon, authenticated;
