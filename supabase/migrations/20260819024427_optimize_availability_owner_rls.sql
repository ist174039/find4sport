-- Mirrors production migration 20260819024427 / optimize_availability_owner_rls.
-- Preserve public reads while limiting owner mutations to authenticated users,
-- add explicit WITH CHECK clauses, and avoid per-row auth.uid() evaluation.

-- professional_availability

drop policy if exists "Professionals can manage their availability" on public.professional_availability;
drop policy if exists "Professionals can insert availability" on public.professional_availability;
drop policy if exists "Professionals can update availability" on public.professional_availability;
drop policy if exists "Professionals can delete availability" on public.professional_availability;

create policy "Professionals can insert availability"
  on public.professional_availability
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_availability.professional_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "Professionals can update availability"
  on public.professional_availability
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_availability.professional_id
        and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_availability.professional_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "Professionals can delete availability"
  on public.professional_availability
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_availability.professional_id
        and p.user_id = (select auth.uid())
    )
  );

-- space_rooms

drop policy if exists "Space owners can manage their rooms" on public.space_rooms;
drop policy if exists "Space owners can insert rooms" on public.space_rooms;
drop policy if exists "Space owners can update rooms" on public.space_rooms;
drop policy if exists "Space owners can delete rooms" on public.space_rooms;

create policy "Space owners can insert rooms"
  on public.space_rooms
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.sport_spaces s
      where s.id = space_rooms.space_id
        and s.owner_user_id = (select auth.uid())
    )
  );

create policy "Space owners can update rooms"
  on public.space_rooms
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.sport_spaces s
      where s.id = space_rooms.space_id
        and s.owner_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.sport_spaces s
      where s.id = space_rooms.space_id
        and s.owner_user_id = (select auth.uid())
    )
  );

create policy "Space owners can delete rooms"
  on public.space_rooms
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.sport_spaces s
      where s.id = space_rooms.space_id
        and s.owner_user_id = (select auth.uid())
    )
  );

-- space_room_availability

drop policy if exists "Space owners can manage room availability" on public.space_room_availability;
drop policy if exists "Space owners can insert room availability" on public.space_room_availability;
drop policy if exists "Space owners can update room availability" on public.space_room_availability;
drop policy if exists "Space owners can delete room availability" on public.space_room_availability;

create policy "Space owners can insert room availability"
  on public.space_room_availability
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.space_rooms sr
      join public.sport_spaces s on s.id = sr.space_id
      where sr.id = space_room_availability.room_id
        and s.owner_user_id = (select auth.uid())
    )
  );

create policy "Space owners can update room availability"
  on public.space_room_availability
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.space_rooms sr
      join public.sport_spaces s on s.id = sr.space_id
      where sr.id = space_room_availability.room_id
        and s.owner_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.space_rooms sr
      join public.sport_spaces s on s.id = sr.space_id
      where sr.id = space_room_availability.room_id
        and s.owner_user_id = (select auth.uid())
    )
  );

create policy "Space owners can delete room availability"
  on public.space_room_availability
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.space_rooms sr
      join public.sport_spaces s on s.id = sr.space_id
      where sr.id = space_room_availability.room_id
        and s.owner_user_id = (select auth.uid())
    )
  );
