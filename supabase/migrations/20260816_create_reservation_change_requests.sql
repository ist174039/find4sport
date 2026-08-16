create table if not exists public.reservation_change_requests (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  requested_date date not null,
  requested_start_time time without time zone not null,
  requested_end_time time without time zone not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  reviewer_id uuid references auth.users(id) on delete set null,
  reviewer_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint reservation_change_time_order check (requested_start_time < requested_end_time)
);

create unique index if not exists reservation_change_one_pending_idx
  on public.reservation_change_requests(reservation_id)
  where status = 'pending';
create index if not exists reservation_change_reservation_idx
  on public.reservation_change_requests(reservation_id, created_at desc);
create index if not exists reservation_change_requested_by_idx
  on public.reservation_change_requests(requested_by, created_at desc);

alter table public.reservation_change_requests enable row level security;
revoke all on table public.reservation_change_requests from anon, authenticated;
grant select, insert, update, delete on table public.reservation_change_requests to service_role;
