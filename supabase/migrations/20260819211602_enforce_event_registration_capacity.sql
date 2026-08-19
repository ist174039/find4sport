create or replace function public.enforce_event_participant_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_capacity integer;
  ticket_capacity integer;
  active_count integer;
begin
  if new.status not in ('pending', 'confirmed') then
    return new;
  end if;

  select capacity
    into event_capacity
  from public.events
  where id = new.event_id
  for update;

  if event_capacity is not null and event_capacity > 0 then
    select count(*)::integer
      into active_count
    from public.event_participants
    where event_id = new.event_id
      and status in ('pending', 'confirmed')
      and (tg_op = 'INSERT' or id <> new.id);

    if active_count >= event_capacity then
      raise exception using errcode = 'P0001', message = 'EVENT_CAPACITY_EXCEEDED';
    end if;
  end if;

  if new.ticket_type_id is not null then
    select capacity
      into ticket_capacity
    from public.event_ticket_types
    where id = new.ticket_type_id
      and event_id = new.event_id
    for update;

    if ticket_capacity is not null and ticket_capacity > 0 then
      select count(*)::integer
        into active_count
      from public.event_participants
      where ticket_type_id = new.ticket_type_id
        and status in ('pending', 'confirmed')
        and (tg_op = 'INSERT' or id <> new.id);

      if active_count >= ticket_capacity then
        raise exception using errcode = 'P0001', message = 'TICKET_CAPACITY_EXCEEDED';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_event_participant_capacity on public.event_participants;
create trigger enforce_event_participant_capacity
before insert or update of event_id, ticket_type_id, status
on public.event_participants
for each row
execute function public.enforce_event_participant_capacity();
