create or replace function public.enforce_reservation_provider_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_user_id uuid;
  provider_role text;
  entity_status text;
begin
  if new.space_id is not null then
    select s.owner_user_id, u.type, s.status
      into provider_user_id, provider_role, entity_status
    from public.sport_spaces s
    left join public.platform_users u on u.id = s.owner_user_id
    where s.id = new.space_id;

    if not found or provider_user_id is null or provider_role <> 'venue_manager' or entity_status <> 'active' then
      raise exception 'space_provider_not_bookable';
    end if;
  elsif new.professional_id is not null then
    select p.user_id, u.type, p.status
      into provider_user_id, provider_role, entity_status
    from public.professionals p
    left join public.platform_users u on u.id = p.user_id
    where p.id = new.professional_id;

    if not found or provider_user_id is null or provider_role <> 'professional' or entity_status <> 'active' then
      raise exception 'professional_provider_not_bookable';
    end if;
  else
    raise exception 'reservation_provider_required';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_reservation_provider_integrity() from public, anon, authenticated;
grant execute on function public.enforce_reservation_provider_integrity() to service_role;

drop trigger if exists reservations_provider_integrity on public.reservations;
create trigger reservations_provider_integrity
before insert or update of space_id, professional_id on public.reservations
for each row execute function public.enforce_reservation_provider_integrity();
