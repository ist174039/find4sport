create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references public.platform_users(id) on delete cascade,
  target_type text not null check (target_type in ('post','comment','community')),
  target_id uuid not null,
  reason text not null default 'other' check (reason in ('spam','harassment','hate','nudity','violence','fraud','other')),
  details text,
  status text not null default 'pending' check (status in ('pending','reviewing','resolved','dismissed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reporter_user_id, target_type, target_id)
);

alter table public.content_reports enable row level security;

drop policy if exists "Users can create own content reports" on public.content_reports;
create policy "Users can create own content reports"
on public.content_reports for insert
to authenticated
with check (reporter_user_id = auth.uid());

drop policy if exists "Users can view own content reports" on public.content_reports;
create policy "Users can view own content reports"
on public.content_reports for select
to authenticated
using (reporter_user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage content reports" on public.content_reports;
create policy "Admins can manage content reports"
on public.content_reports for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists content_reports_status_created_idx
  on public.content_reports(status, created_at desc);
create index if not exists content_reports_target_idx
  on public.content_reports(target_type, target_id);
