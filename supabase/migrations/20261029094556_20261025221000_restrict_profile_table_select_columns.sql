-- Restrict direct PostgREST reads of profile tables to an explicit public allowlist.
-- Ownership checks used by RLS on related tables move behind SECURITY DEFINER helpers,
-- so authenticated callers no longer need direct access to internal owner identifiers.
begin;

create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to anon, authenticated;

create or replace function app_private.owns_professional(target_professional_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.professionals p
    where p.id = target_professional_id
      and p.user_id = (select auth.uid())
  );
$$;

create or replace function app_private.owns_space(target_space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.sport_spaces s
    where s.id = target_space_id
      and s.owner_user_id = (select auth.uid())
  );
$$;

create or replace function app_private.manages_space(target_space_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.sport_spaces s
    where s.id = target_space_id
      and (
        s.owner_user_id = (select auth.uid())
        or s.created_by = (select auth.uid())
      )
  );
$$;

create or replace function app_private.owns_room(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.space_rooms r
    join public.sport_spaces s on s.id = r.space_id
    where r.id = target_room_id
      and s.owner_user_id = (select auth.uid())
  );
$$;

revoke all on function app_private.owns_professional(uuid) from public;
revoke all on function app_private.owns_space(uuid) from public;
revoke all on function app_private.manages_space(uuid) from public;
revoke all on function app_private.owns_room(uuid) from public;
grant execute on function app_private.owns_professional(uuid) to authenticated;
grant execute on function app_private.owns_space(uuid) to authenticated;
grant execute on function app_private.manages_space(uuid) to authenticated;
grant execute on function app_private.owns_room(uuid) to authenticated;

-- Rebind RLS ownership checks so related-table policies do not depend on direct
-- SELECT privilege for professionals.user_id or sport_spaces.owner_user_id.
drop policy if exists "Professionals can delete availability" on public.professional_availability;
create policy "Professionals can delete availability" on public.professional_availability
for delete to authenticated using (app_private.owns_professional(professional_id));
drop policy if exists "Professionals can insert availability" on public.professional_availability;
create policy "Professionals can insert availability" on public.professional_availability
for insert to authenticated with check (app_private.owns_professional(professional_id));
drop policy if exists "Professionals can update availability" on public.professional_availability;
create policy "Professionals can update availability" on public.professional_availability
for update to authenticated using (app_private.owns_professional(professional_id))
with check (app_private.owns_professional(professional_id));

drop policy if exists "Owners can delete professional categories" on public.professional_categories;
create policy "Owners can delete professional categories" on public.professional_categories
for delete to authenticated using (app_private.owns_professional(professional_id));
drop policy if exists "Owners can insert professional categories" on public.professional_categories;
create policy "Owners can insert professional categories" on public.professional_categories
for insert to authenticated with check (app_private.owns_professional(professional_id));
drop policy if exists "Owners can update professional categories" on public.professional_categories;
create policy "Owners can update professional categories" on public.professional_categories
for update to authenticated using (app_private.owns_professional(professional_id))
with check (app_private.owns_professional(professional_id));

drop policy if exists "Professionals create own unavailable blocks" on public.professional_unavailability;
create policy "Professionals create own unavailable blocks" on public.professional_unavailability
for insert to authenticated with check (app_private.owns_professional(professional_id));
drop policy if exists "Professionals update own unavailable blocks" on public.professional_unavailability;
create policy "Professionals update own unavailable blocks" on public.professional_unavailability
for update to authenticated using (app_private.owns_professional(professional_id))
with check (app_private.owns_professional(professional_id));
drop policy if exists "Professionals delete own unavailable blocks" on public.professional_unavailability;
create policy "Professionals delete own unavailable blocks" on public.professional_unavailability
for delete to authenticated using (app_private.owns_professional(professional_id));

drop policy if exists "Owners can delete qualifications" on public.qualifications;
create policy "Owners can delete qualifications" on public.qualifications
for delete to authenticated using (app_private.owns_professional(professional_id));
drop policy if exists "Owners can insert qualifications" on public.qualifications;
create policy "Owners can insert qualifications" on public.qualifications
for insert to authenticated with check (app_private.owns_professional(professional_id));
drop policy if exists "Owners can update qualifications" on public.qualifications;
create policy "Owners can update qualifications" on public.qualifications
for update to authenticated using (app_private.owns_professional(professional_id))
with check (app_private.owns_professional(professional_id));

drop policy if exists "reservations_participant_read" on public.reservations;
create policy "reservations_participant_read" on public.reservations
for select to authenticated using (
  (select auth.uid()) = user_id
  or app_private.owns_professional(professional_id)
  or app_private.owns_space(space_id)
);

drop policy if exists "reviews_read" on public.reviews;
create policy "reviews_read" on public.reviews
for select to public using (
  status = 'approved'::review_status
  or user_id = (select auth.uid())
  or app_private.owns_professional(professional_id)
  or app_private.owns_space(space_id)
  or exists (
    select 1 from public.events e
    where e.id = reviews.event_id
      and e.created_by = (select auth.uid())
  )
);

drop policy if exists "service_package_purchases_participant_read" on public.service_package_purchases;
create policy "service_package_purchases_participant_read" on public.service_package_purchases
for select to authenticated using (
  user_id = (select auth.uid())
  or app_private.owns_professional(professional_id)
);

drop policy if exists "Service owners can read own services" on public.services;
create policy "Service owners can read own services" on public.services
for select to authenticated using (app_private.owns_professional(professional_id));

drop policy if exists "Owners can delete space categories" on public.space_categories;
create policy "Owners can delete space categories" on public.space_categories
for delete to authenticated using (app_private.manages_space(space_id));
drop policy if exists "Owners can insert space categories" on public.space_categories;
create policy "Owners can insert space categories" on public.space_categories
for insert to authenticated with check (app_private.manages_space(space_id));
drop policy if exists "Owners can update space categories" on public.space_categories;
create policy "Owners can update space categories" on public.space_categories
for update to authenticated using (app_private.manages_space(space_id))
with check (app_private.manages_space(space_id));

drop policy if exists "space_professionals_authenticated_read" on public.space_professionals;
create policy "space_professionals_authenticated_read" on public.space_professionals
for select to authenticated using (
  status = 'active'
  or app_private.owns_professional(professional_id)
  or app_private.owns_space(space_id)
);
drop policy if exists "space_professionals_authenticated_insert" on public.space_professionals;
create policy "space_professionals_authenticated_insert" on public.space_professionals
for insert to authenticated with check (
  app_private.owns_professional(professional_id)
  or app_private.owns_space(space_id)
);
drop policy if exists "space_professionals_authenticated_update" on public.space_professionals;
create policy "space_professionals_authenticated_update" on public.space_professionals
for update to authenticated using (
  app_private.owns_professional(professional_id)
  or app_private.owns_space(space_id)
) with check (
  app_private.owns_professional(professional_id)
  or app_private.owns_space(space_id)
);
drop policy if exists "space_professionals_authenticated_delete" on public.space_professionals;
create policy "space_professionals_authenticated_delete" on public.space_professionals
for delete to authenticated using (
  app_private.owns_professional(professional_id)
  or app_private.owns_space(space_id)
);

drop policy if exists "Space owners can delete rooms" on public.space_rooms;
create policy "Space owners can delete rooms" on public.space_rooms
for delete to authenticated using (app_private.owns_space(space_id));
drop policy if exists "Space owners can insert rooms" on public.space_rooms;
create policy "Space owners can insert rooms" on public.space_rooms
for insert to authenticated with check (app_private.owns_space(space_id));
drop policy if exists "Space owners can update rooms" on public.space_rooms;
create policy "Space owners can update rooms" on public.space_rooms
for update to authenticated using (app_private.owns_space(space_id))
with check (app_private.owns_space(space_id));

drop policy if exists "Space owners can delete room availability" on public.space_room_availability;
create policy "Space owners can delete room availability" on public.space_room_availability
for delete to authenticated using (app_private.owns_room(room_id));
drop policy if exists "Space owners can insert room availability" on public.space_room_availability;
create policy "Space owners can insert room availability" on public.space_room_availability
for insert to authenticated with check (app_private.owns_room(room_id));
drop policy if exists "Space owners can update room availability" on public.space_room_availability;
create policy "Space owners can update room availability" on public.space_room_availability
for update to authenticated using (app_private.owns_room(room_id))
with check (app_private.owns_room(room_id));

-- Discovery is an explicit allowlist contract. SECURITY DEFINER lets the function
-- use internal ownership columns without granting those columns through PostgREST.
alter function public.discover_professionals(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer)
  security definer;
alter function public.discover_spaces(double precision,double precision,double precision,uuid[],text,text,numeric,numeric,numeric,text,integer,integer)
  security definer;

-- Remove broad direct reads, then grant only fields intentionally safe for generic
-- REST relations. Contact and financial fields remain server-mediated.
revoke select on table public.professionals from anon, authenticated;
grant select (
  id, full_name, professional_name, bio, avatar_url, address, latitude, longitude,
  status, public_slug, rating_avg, review_count, views_count, website, social_links,
  is_verified, is_premium, gallery_urls, created_at, cover_url
) on table public.professionals to anon, authenticated;

revoke select on table public.sport_spaces from anon, authenticated;
grant select (
  id, name, slug, description, address, latitude, longitude, website, opening_hours,
  amenities, status, is_verified, rating_avg, review_count, views_count, gallery_urls,
  created_at, cover_url, logo_url
) on table public.sport_spaces to anon, authenticated;

commit;
