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
