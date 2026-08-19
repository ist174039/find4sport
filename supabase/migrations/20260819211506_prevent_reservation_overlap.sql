create extension if not exists btree_gist;

alter table public.reservations
  add constraint reservations_no_professional_overlap
  exclude using gist (
    professional_id with =,
    tsrange(date + start_time, date + end_time, '[)') with &&
  )
  where (professional_id is not null and status in ('pending','paid','confirmed'));

alter table public.reservations
  add constraint reservations_no_room_overlap
  exclude using gist (
    space_room_id with =,
    tsrange(date + start_time, date + end_time, '[)') with &&
  )
  where (space_room_id is not null and status in ('pending','paid','confirmed'));
