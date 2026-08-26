create table if not exists public.event_categories (
  event_id uuid not null references public.events(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, category_id)
);

create index if not exists event_categories_category_id_idx on public.event_categories(category_id);
create index if not exists event_categories_event_id_idx on public.event_categories(event_id);

alter table public.event_categories enable row level security;

drop policy if exists "event_categories_public_read" on public.event_categories;
create policy "event_categories_public_read" on public.event_categories for select using (true);

insert into public.event_categories (event_id, category_id)
select e.id, e.category_id
from public.events e
join public.categories c on c.id = e.category_id
where e.category_id is not null
  and coalesce(c.taxonomy_type, 'modality') = 'modality'
on conflict do nothing;
