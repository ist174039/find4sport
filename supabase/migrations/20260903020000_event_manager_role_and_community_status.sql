alter type public.user_role add value if not exists 'event_manager';

alter table public.communities
  add column if not exists status text not null default 'active'
  check (status in ('active', 'inactive'));

create index if not exists communities_status_idx on public.communities(status);

drop policy if exists "Inactive communities are not public" on public.communities;
create policy "Inactive communities are not public"
  on public.communities as restrictive for select to anon, authenticated
  using (status = 'active');

alter table public.posts drop constraint if exists posts_community_id_fkey;
alter table public.posts add constraint posts_community_id_fkey foreign key (community_id) references public.communities(id) on delete set null;
