-- Security regression test: financial state must be backend-owned.
-- Run against a migrated test database (e.g. Supabase local CI).
-- This test verifies SQL privileges independently of RLS row predicates.

begin;

-- authenticated must not have broad table UPDATE on reservations.
do $$
begin
  if has_table_privilege('authenticated', 'public.reservations', 'UPDATE') then
    raise exception 'SECURITY REGRESSION: authenticated has broad UPDATE on reservations';
  end if;
end $$;

-- Operational columns intentionally remain client-updatable for now.
do $$
begin
  if not has_column_privilege('authenticated', 'public.reservations', 'status', 'UPDATE') then
    raise exception 'EXPECTED PRIVILEGE MISSING: authenticated cannot update reservations.status';
  end if;
  if not has_column_privilege('authenticated', 'public.reservations', 'service_delivery_status', 'UPDATE') then
    raise exception 'EXPECTED PRIVILEGE MISSING: authenticated cannot update reservations.service_delivery_status';
  end if;
end $$;

-- Financial/ownership columns must never be directly mutable by authenticated clients.
do $$
declare
  col text;
begin
  foreach col in array array[
    'user_id','professional_id','service_id','space_id','amount',
    'stripe_session_id','payment_status','settlement_status'
  ] loop
    if has_column_privilege('authenticated', 'public.reservations', col, 'UPDATE') then
      raise exception 'SECURITY REGRESSION: authenticated can UPDATE reservations.%', col;
    end if;
  end loop;
end $$;

-- Financial ledgers/lifecycle tables are read-only to authenticated clients.
do $$
declare
  tbl text;
  privilege text;
begin
  foreach tbl in array array[
    'transactions',
    'service_package_purchases',
    'user_subscriptions',
    'subscription_plans',
    'plan_entitlements',
    'user_entitlement_overrides',
    'feature_usage',
    'plan_change_history',
    'event_participants'
  ] loop
    foreach privilege in array array['INSERT','UPDATE','DELETE'] loop
      if has_table_privilege('authenticated', format('public.%I', tbl), privilege) then
        raise exception 'SECURITY REGRESSION: authenticated has % on public.%', privilege, tbl;
      end if;
    end loop;
  end loop;
end $$;

-- Anonymous users must not mutate plan economics either.
do $$
declare
  tbl text;
  privilege text;
begin
  foreach tbl in array array['subscription_plans','plan_entitlements'] loop
    foreach privilege in array array['INSERT','UPDATE','DELETE'] loop
      if has_table_privilege('anon', format('public.%I', tbl), privilege) then
        raise exception 'SECURITY REGRESSION: anon has % on public.%', privilege, tbl;
      end if;
    end loop;
  end loop;
end $$;

rollback;
