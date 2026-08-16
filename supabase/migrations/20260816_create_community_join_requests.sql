create table if not exists public.community_join_requests (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.platform_users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  reviewed_by uuid references public.platform_users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (community_id, user_id)
);

alter table public.community_join_requests enable row level security;

drop policy if exists "Users can view own community join requests" on public.community_join_requests;
create policy "Users can view own community join requests"
on public.community_join_requests for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.community_members cm
    where cm.community_id = community_join_requests.community_id
      and cm.user_id = auth.uid()
      and cm.role = 'admin'
  )
);

drop policy if exists "Users can create own community join requests" on public.community_join_requests;
create policy "Users can create own community join requests"
on public.community_join_requests for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Community admins can update join requests" on public.community_join_requests;
create policy "Community admins can update join requests"
on public.community_join_requests for update
to authenticated
using (
  exists (
    select 1 from public.community_members cm
    where cm.community_id = community_join_requests.community_id
      and cm.user_id = auth.uid()
      and cm.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.community_members cm
    where cm.community_id = community_join_requests.community_id
      and cm.user_id = auth.uid()
      and cm.role = 'admin'
  )
);

create index if not exists community_join_requests_pending_idx
on public.community_join_requests(community_id, status, created_at desc);
