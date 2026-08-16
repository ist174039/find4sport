create or replace function public.enforce_profile_gallery_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_plan_id uuid;
  v_limit bigint;
  v_unlimited boolean := false;
  v_count bigint;
begin
  if tg_table_name = 'professionals' then v_user_id := new.user_id;
  elsif tg_table_name = 'sport_spaces' then v_user_id := new.owner_user_id;
  else return new;
  end if;
  if v_user_id is null then return new; end if;

  select case when o.is_unlimited then null else o.integer_value end, coalesce(o.is_unlimited,false)
    into v_limit, v_unlimited
  from public.user_entitlement_overrides o
  where o.user_id = v_user_id and o.feature_key = 'profile.photos.max'
    and (o.expires_at is null or o.expires_at > now())
  limit 1;

  if not found then
    select us.plan_id into v_plan_id from public.user_subscriptions us where us.user_id = v_user_id;
    if v_plan_id is null then
      select sp.id into v_plan_id
      from public.subscription_plans sp
      join public.platform_users pu on pu.id = v_user_id and pu.type::text = sp.audience
      where sp.code = coalesce((select us2.tier::text from public.user_subscriptions us2 where us2.user_id=v_user_id), 'free')
        and sp.is_active = true
      limit 1;
    end if;
    select case when pe.is_unlimited then null else pe.integer_value end, coalesce(pe.is_unlimited,false)
      into v_limit, v_unlimited
    from public.plan_entitlements pe
    where pe.plan_id = v_plan_id and pe.feature_key = 'profile.photos.max'
    limit 1;
  end if;

  if v_unlimited or v_limit is null then return new; end if;
  v_count := coalesce(cardinality(new.gallery_urls),0) + coalesce(cardinality(new.private_gallery_urls),0);
  if v_count > v_limit then
    raise exception 'Plano permite no máximo % fotografias na galeria', v_limit using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_profile_gallery_limit() from public, anon, authenticated;

drop trigger if exists trg_professional_gallery_limit on public.professionals;
create trigger trg_professional_gallery_limit before insert or update of gallery_urls, private_gallery_urls on public.professionals for each row execute function public.enforce_profile_gallery_limit();

drop trigger if exists trg_space_gallery_limit on public.sport_spaces;
create trigger trg_space_gallery_limit before insert or update of gallery_urls, private_gallery_urls on public.sport_spaces for each row execute function public.enforce_profile_gallery_limit();
