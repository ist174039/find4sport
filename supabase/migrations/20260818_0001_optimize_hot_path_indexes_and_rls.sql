-- Production hardening: targeted hot-path indexes and RLS optimization.

create index if not exists admins_auth_user_id_idx on public.admins (auth_user_id);
create index if not exists events_created_by_idx on public.events (created_by);
create index if not exists events_professional_id_idx on public.events (professional_id) where professional_id is not null;
create index if not exists events_category_id_idx on public.events (category_id) where category_id is not null;
create index if not exists user_follows_following_id_idx on public.user_follows (following_id);
create index if not exists favorites_professional_id_idx on public.favorites (professional_id) where professional_id is not null;
create index if not exists favorites_space_id_idx on public.favorites (space_id) where space_id is not null;
create index if not exists favorites_event_id_idx on public.favorites (event_id) where event_id is not null;

drop policy if exists "Users can view their own favorites" on public.favorites;
create policy "Users can view their own favorites" on public.favorites for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own favorites" on public.favorites;
create policy "Users can insert their own favorites" on public.favorites for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own favorites" on public.favorites;
create policy "Users can delete their own favorites" on public.favorites for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Allow authenticated users to insert follow" on public.user_follows;
create policy "Allow authenticated users to insert follow" on public.user_follows for insert to authenticated with check ((select auth.uid()) = follower_id);

drop policy if exists "Allow authenticated users to delete follow" on public.user_follows;
create policy "Allow authenticated users to delete follow" on public.user_follows for delete to authenticated using ((select auth.uid()) = follower_id);

drop policy if exists "Events readable by everyone if published" on public.events;
create policy "Events readable by everyone if published" on public.events for select to public using (status = 'published'::event_status or (select auth.uid()) = created_by);

drop policy if exists "Authenticated users can create events" on public.events;
create policy "Authenticated users can create events" on public.events for insert to authenticated with check ((select auth.uid()) = created_by);

drop policy if exists "Creators can update events" on public.events;
create policy "Creators can update events" on public.events for update to authenticated using ((select auth.uid()) = created_by) with check ((select auth.uid()) = created_by);

drop policy if exists "Users can update their own profile" on public.platform_users;
create policy "Users can update their own profile" on public.platform_users for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Users can view their own profile" on public.platform_users;
