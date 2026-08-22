-- Additive taxonomy evolution: existing categories remain root categories.
alter table public.categories add column if not exists parent_id uuid null references public.categories(id) on delete restrict;
alter table public.categories add column if not exists icon_key text null;

create index if not exists categories_parent_id_idx on public.categories(parent_id);

-- A category can never be its own direct parent. Deeper cycle prevention is enforced by trigger below.
alter table public.categories drop constraint if exists categories_parent_not_self;
alter table public.categories add constraint categories_parent_not_self check (parent_id is null or parent_id <> id);

create or replace function public.prevent_category_cycle()
returns trigger
language plpgsql
as $$
declare
  cursor_id uuid;
begin
  if new.parent_id is null then return new; end if;
  if new.parent_id = new.id then raise exception 'A categoria não pode ser pai de si própria.'; end if;
  cursor_id := new.parent_id;
  while cursor_id is not null loop
    if cursor_id = new.id then raise exception 'A hierarquia de categorias não pode conter ciclos.'; end if;
    select parent_id into cursor_id from public.categories where id = cursor_id;
  end loop;
  return new;
end;
$$;

drop trigger if exists categories_prevent_cycle on public.categories;
create trigger categories_prevent_cycle before insert or update of parent_id on public.categories for each row execute function public.prevent_category_cycle();

-- Descendant resolver for search/filter expansion. Includes the selected category itself.
create or replace function public.category_descendant_ids(root_id uuid)
returns table(id uuid)
language sql
stable
security invoker
set search_path = public
as $$
  with recursive tree as (
    select c.id from public.categories c where c.id = root_id
    union all
    select child.id from public.categories child join tree parent on child.parent_id = parent.id
  )
  select tree.id from tree;
$$;
