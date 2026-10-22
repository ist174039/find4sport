-- PROPOSAL ONLY. Do not apply to Supabase production without review and an
-- isolated project migration rehearsal. This provides a database-level
-- linearization point between a professional reservation insert and account
-- moderation updates.

create or replace function public.enforce_professional_reservation_eligibility()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  owner_id uuid;
  profile_status text;
  owner_status text;
  owner_suspended_until timestamptz;
begin
  if tg_op = 'UPDATE' and new.professional_id is not distinct from old.professional_id then
    return new;
  end if;

  if new.professional_id is null then
    return new;
  end if;

  select p.user_id, p.status
    into owner_id, profile_status
    from public.professionals p
   where p.id = new.professional_id
   for share;

  if not found or owner_id is null or profile_status <> 'active' then
    raise exception using errcode = '23514', message = 'professional_booking_owner_ineligible';
  end if;

  select pu.account_status, pu.suspended_until
    into owner_status, owner_suspended_until
    from public.platform_users pu
   where pu.id = owner_id
   for share;

  if not found or not (
    owner_status = 'active'
    or (owner_status = 'suspended' and owner_suspended_until <= clock_timestamp())
  ) then
    raise exception using errcode = '23514', message = 'professional_booking_owner_ineligible';
  end if;

  return new;
end;
$$;

drop trigger if exists reservations_enforce_professional_owner_eligibility
  on public.reservations;
create trigger reservations_enforce_professional_owner_eligibility
before insert or update of professional_id on public.reservations
for each row
execute function public.enforce_professional_reservation_eligibility();

revoke all on function public.enforce_professional_reservation_eligibility()
  from public, anon, authenticated;
grant execute on function public.enforce_professional_reservation_eligibility()
  to service_role;
