create or replace function public.enforce_event_creation_entitlement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text;
  v_plan_id uuid;
  v_enabled boolean;
  v_override_enabled boolean;
begin
  if new.created_by is null then return new; end if;

  select type::text into v_type from public.platform_users where id = new.created_by;
  if v_type not in ('professional','venue_manager') then return new; end if;

  select boolean_value into v_override_enabled
  from public.user_entitlement_overrides
  where user_id = new.created_by
    and feature_key = 'events.create.enabled'
    and value_type = 'boolean'
    and (expires_at is null or expires_at > now())
  limit 1;

  if found then
    if coalesce(v_override_enabled,false) = false then
      raise exception 'Criação de eventos não disponível no plano atual' using errcode='P0001';
    end if;
    return new;
  end if;

  select plan_id into v_plan_id from public.user_subscriptions where user_id = new.created_by;
  if v_plan_id is null then
    select sp.id into v_plan_id
    from public.subscription_plans sp
    where sp.audience = v_type
      and sp.code = coalesce((select us.tier::text from public.user_subscriptions us where us.user_id = new.created_by), 'free')
      and sp.is_active = true
    order by sp.sort_order
    limit 1;
  end if;

  select boolean_value into v_enabled
  from public.plan_entitlements
  where plan_id = v_plan_id
    and feature_key = 'events.create.enabled'
    and value_type = 'boolean'
  limit 1;

  if coalesce(v_enabled,false) = false then
    raise exception 'Criação de eventos não disponível no plano atual' using errcode='P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_event_creation_entitlement() from public, anon, authenticated;

drop trigger if exists trg_events_create_entitlement on public.events;
create trigger trg_events_create_entitlement before insert on public.events for each row execute function public.enforce_event_creation_entitlement();
