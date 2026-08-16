-- Serialize booking writes per resource/day so concurrent requests cannot both pass
-- the overlap check. This protects every writer, not only the Next.js booking flow.

create or replace function public.enforce_reservation_slot_exclusivity()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  professional_key bigint;
  room_key bigint;
  conflict_id uuid;
begin
  if new.status not in ('pending', 'paid', 'confirmed') then
    return new;
  end if;

  if new.start_time is null or new.end_time is null or new.date is null or new.start_time >= new.end_time then
    raise exception using errcode = '23514', message = 'invalid_reservation_interval';
  end if;

  if new.professional_id is not null then
    professional_key := hashtextextended('professional:' || new.professional_id::text || ':' || new.date::text, 0);
  end if;
  if new.space_room_id is not null then
    room_key := hashtextextended('room:' || new.space_room_id::text || ':' || new.date::text, 0);
  end if;

  -- Always acquire multiple locks in numeric order to avoid lock inversion/deadlocks.
  if professional_key is not null and room_key is not null then
    if professional_key <= room_key then
      perform pg_advisory_xact_lock(professional_key);
      perform pg_advisory_xact_lock(room_key);
    else
      perform pg_advisory_xact_lock(room_key);
      perform pg_advisory_xact_lock(professional_key);
    end if;
  elsif professional_key is not null then
    perform pg_advisory_xact_lock(professional_key);
  elsif room_key is not null then
    perform pg_advisory_xact_lock(room_key);
  end if;

  select r.id
    into conflict_id
    from public.reservations r
   where r.date = new.date
     and r.status in ('pending', 'paid', 'confirmed')
     and r.id is distinct from new.id
     and r.start_time < new.end_time
     and r.end_time > new.start_time
     and (
       (new.professional_id is not null and r.professional_id = new.professional_id)
       or
       (new.space_room_id is not null and r.space_room_id = new.space_room_id)
     )
   limit 1;

  if conflict_id is not null then
    raise exception using errcode = '23P01', message = 'reservation_slot_conflict';
  end if;

  return new;
end;
$$;

drop trigger if exists reservations_enforce_slot_exclusivity on public.reservations;
create trigger reservations_enforce_slot_exclusivity
before insert or update of date, start_time, end_time, status, professional_id, space_room_id
on public.reservations
for each row
execute function public.enforce_reservation_slot_exclusivity();
