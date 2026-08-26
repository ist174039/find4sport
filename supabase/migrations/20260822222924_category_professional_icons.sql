alter table public.categories add column if not exists icon_key text;

comment on column public.categories.icon_key is 'Controlled design-system icon identifier. Emoji is legacy only and must not be rendered by the application.';

create index if not exists categories_parent_id_idx on public.categories(parent_id);
