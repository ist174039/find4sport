-- P0 #41: enforce public visibility in aggregate search RPC. Review before deployment.
CREATE OR REPLACE FUNCTION public.search_public_entities(p_q text DEFAULT NULL::text, p_entity_type text DEFAULT 'todos'::text, p_category_ids uuid[] DEFAULT NULL::uuid[], p_location text DEFAULT NULL::text, p_rating numeric DEFAULT NULL::numeric, p_lat double precision DEFAULT NULL::double precision, p_lng double precision DEFAULT NULL::double precision, p_radius double precision DEFAULT NULL::double precision, p_date_from timestamp with time zone DEFAULT NULL::timestamp with time zone, p_date_to timestamp with time zone DEFAULT NULL::timestamp with time zone, p_sort text DEFAULT 'relevance'::text, p_offset integer DEFAULT 0, p_limit integer DEFAULT 24)
 RETURNS TABLE(item jsonb, total_count bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
with candidates as (
  select 'professional'::text item_type,p.id,p.professional_name title_alt,p.full_name title,
    p.bio subtitle,p.address,p.address map_address,p.rating_avg,p.review_count,p.is_verified,
    p.avatar_url image_url,'/profissionais/'||coalesce(p.public_slug,p.id::text) link,p.created_at,null::timestamptz start_date,
    p.latitude,p.longitude,
    (select avg(s.price) from public.services s where s.professional_id=p.id and s.is_active=true) average_price,
    null::numeric price_min,null::bigint member_count
  from public.professionals p where p.status='active'
    and exists (select 1 from public.platform_users pu where pu.id=p.user_id and coalesce(pu.account_status,'active') not in ('blocked','deactivated') and (pu.account_status is distinct from 'suspended' or (pu.suspended_until is not null and pu.suspended_until <= now())))
    and p_entity_type in ('todos','profissionais')
    and (p_category_ids is null or exists(select 1 from public.professional_categories pc where pc.professional_id=p.id and pc.category_id=any(p_category_ids)))
  union all
  select 'space',s.id,null,s.name,s.description,s.address,s.address,s.rating_avg,s.review_count,s.is_verified,
    coalesce(s.cover_url,s.gallery_urls[1]),'/espacos/'||coalesce(s.slug,s.id::text),s.created_at,null,
    s.latitude,s.longitude,(select avg(r.price_per_hour) from public.space_rooms r where r.space_id=s.id and r.is_active=true),
    null,null
  from public.sport_spaces s where s.status='active'
    and exists (select 1 from public.platform_users pu where pu.id=coalesce(s.owner_user_id,s.created_by) and coalesce(pu.account_status,'active') not in ('blocked','deactivated') and (pu.account_status is distinct from 'suspended' or (pu.suspended_until is not null and pu.suspended_until <= now())))
    and p_entity_type in ('todos','espacos')
    and (p_category_ids is null or exists(select 1 from public.space_categories sc where sc.space_id=s.id and sc.category_id=any(p_category_ids)))
  union all
  select 'event',e.id,null,e.title,e.description,e.address,e.address,null,null,e.is_verified,e.image_url,
    '/eventos/'||coalesce(e.slug,e.id::text),e.created_at,e.start_date,e.latitude,e.longitude,null,e.price_min,null
  from public.events e where e.status='published' and e.start_date>=now()
    and exists (select 1 from public.platform_users pu where pu.id=e.created_by and coalesce(pu.account_status,'active') not in ('blocked','deactivated') and (pu.account_status is distinct from 'suspended' or (pu.suspended_until is not null and pu.suspended_until <= now())))
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
  from public.communities c where c.status='active'
    and exists (select 1 from public.platform_users pu where pu.id=c.created_by and coalesce(pu.account_status,'active') not in ('blocked','deactivated') and (pu.account_status is distinct from 'suspended' or (pu.suspended_until is not null and pu.suspended_until <= now())))
    and p_entity_type in ('todos','comunidades')
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
$function$
;
