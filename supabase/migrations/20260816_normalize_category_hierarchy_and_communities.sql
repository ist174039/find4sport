-- Canonical taxonomy hierarchy and community relation.
-- Safe to run on databases that already have categories.parent_id.

alter table public.categories
  add column if not exists parent_id uuid null references public.categories(id) on delete set null;

create index if not exists categories_parent_id_idx on public.categories(parent_id);

-- Prevent direct self-parenting. Deeper cycles should be prevented by admin taxonomy logic.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'categories_not_own_parent'
  ) then
    alter table public.categories
      add constraint categories_not_own_parent check (parent_id is null or parent_id <> id);
  end if;
end $$;

create table if not exists public.community_categories (
  community_id uuid not null references public.communities(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (community_id, category_id)
);

create index if not exists community_categories_category_id_idx on public.community_categories(category_id);

-- Backfill the legacy free-text category where it maps unambiguously to a canonical category.
insert into public.community_categories (community_id, category_id)
select c.id, cat.id
from public.communities c
join public.categories cat
  on lower(trim(c.sport_category)) = lower(trim(cat.name))
  or lower(trim(c.sport_category)) = lower(trim(cat.slug))
where nullif(trim(c.sport_category), '') is not null
on conflict do nothing;

alter table public.community_categories enable row level security;

drop policy if exists "community_categories_public_read" on public.community_categories;
create policy "community_categories_public_read"
on public.community_categories
for select
to anon, authenticated
using (true);
