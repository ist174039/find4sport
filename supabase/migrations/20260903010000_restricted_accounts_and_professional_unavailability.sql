-- Restricted accounts retain authentication so they can see the administrative decision,
-- but are removed from every public profile query. Existing Auth bans are intentionally
-- not changed in bulk; moderation actions clear the ban for the specific affected user.

drop policy if exists "Restricted profiles are not public" on public.platform_users;
create policy "Restricted profiles are not public"
  on public.platform_users as restrictive for select to anon, authenticated
  using (account_status = 'active' or (select auth.uid()) = id);

drop policy if exists "Restricted professionals are not public" on public.professionals;
create policy "Restricted professionals are not public"
  on public.professionals as restrictive for select to anon, authenticated
  using (exists (
    select 1 from public.platform_users pu
    where pu.id = professionals.user_id and pu.account_status = 'active'
  ));

create table if not exists public.professional_unavailability (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  date date not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  created_at timestamptz not null default now(),
  constraint professional_unavailability_valid_interval check (start_time < end_time)
);

create index if not exists professional_unavailability_lookup_idx
  on public.professional_unavailability (professional_id, date, start_time, end_time);

alter table public.professional_unavailability enable row level security;
grant select on public.professional_unavailability to anon, authenticated;
grant insert, update, delete on public.professional_unavailability to authenticated;

create policy "Unavailable blocks are publicly readable"
  on public.professional_unavailability for select to anon, authenticated using (true);
create policy "Professionals create own unavailable blocks"
  on public.professional_unavailability for insert to authenticated
  with check (exists (select 1 from public.professionals p where p.id = professional_id and p.user_id = (select auth.uid())));
create policy "Professionals update own unavailable blocks"
  on public.professional_unavailability for update to authenticated
  using (exists (select 1 from public.professionals p where p.id = professional_id and p.user_id = (select auth.uid())))
  with check (exists (select 1 from public.professionals p where p.id = professional_id and p.user_id = (select auth.uid())));
create policy "Professionals delete own unavailable blocks"
  on public.professional_unavailability for delete to authenticated
  using (exists (select 1 from public.professionals p where p.id = professional_id and p.user_id = (select auth.uid())));

create or replace function public.prevent_reservation_during_professional_unavailability()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.professional_id is not null
     and coalesce(new.status::text, 'pending') in ('pending', 'paid', 'confirmed')
     and exists (
       select 1 from public.professional_unavailability b
       where b.professional_id = new.professional_id
         and b.date = new.date
         and b.start_time < new.end_time
         and b.end_time > new.start_time
     ) then
    raise exception using errcode = 'P0001', message = 'PROFESSIONAL_UNAVAILABLE';
  end if;
  return new;
end;
$$;

drop trigger if exists reservations_professional_unavailability_guard on public.reservations;
create trigger reservations_professional_unavailability_guard
  before insert or update of professional_id, date, start_time, end_time, status
  on public.reservations for each row
  execute function public.prevent_reservation_during_professional_unavailability();
