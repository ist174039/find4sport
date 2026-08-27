alter table public.admins drop constraint if exists admins_admin_type_check;
alter table public.admins add constraint admins_admin_type_check
  check (admin_type in ('general', 'operacional', 'content', 'support', 'finance'));

alter table public.platform_users
  add column if not exists account_status text not null default 'active',
  add column if not exists moderation_reason text,
  add column if not exists suspended_until timestamptz,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references auth.users(id) on delete set null;

alter table public.platform_users drop constraint if exists platform_users_account_status_check;
alter table public.platform_users add constraint platform_users_account_status_check
  check (account_status in ('active', 'suspended', 'blocked'));

create index if not exists platform_users_account_status_idx
  on public.platform_users (account_status, suspended_until);
