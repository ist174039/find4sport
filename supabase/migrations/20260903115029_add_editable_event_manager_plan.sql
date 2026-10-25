alter table public.subscription_plans drop constraint if exists subscription_plans_audience_check;
alter table public.subscription_plans add constraint subscription_plans_audience_check check (audience in ('professional','venue_manager','event_manager'));
insert into public.subscription_plans(code,name,audience,description,monthly_price,annual_price,commission_rate,customer_service_fee_rate,is_active,is_public,sort_order)
values('free','Gratuito','event_manager','Plano único para gestores de eventos, sem mensalidade e com comissão por venda.',0,0,15,0,true,true,10)
on conflict(audience,code) do update set name=excluded.name,description=excluded.description,monthly_price=excluded.monthly_price,annual_price=excluded.annual_price,is_active=true,is_public=true,updated_at=now();
insert into public.plan_entitlements(plan_id,feature_key,value_type,boolean_value,integer_value,decimal_value,text_value,json_value,is_unlimited,description)
select target.id,se.feature_key,se.value_type,se.boolean_value,se.integer_value,se.decimal_value,se.text_value,se.json_value,se.is_unlimited,se.description
from public.subscription_plans target join public.subscription_plans source on source.audience='venue_manager' and source.code='pro'
join public.plan_entitlements se on se.plan_id=source.id
where target.audience='event_manager' and target.code='free'
on conflict(plan_id,feature_key) do nothing;
update public.plan_entitlements e set boolean_value=false,updated_at=now() from public.subscription_plans p
where e.plan_id=p.id and p.audience='event_manager' and e.feature_key in('feed.create.enabled','profile.featured.enabled');
update public.plan_entitlements e set integer_value=0,is_unlimited=false,updated_at=now() from public.subscription_plans p
where e.plan_id=p.id and p.audience='event_manager' and e.feature_key in('services.max','posts.monthly.max','posts.images_per_post.max','feed.posts_daily.max');
