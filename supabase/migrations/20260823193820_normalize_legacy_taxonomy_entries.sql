insert into public.categories (name,slug,taxonomy_type,is_active,code) values ('Compressão e Recuperação','compressao-recuperacao','specialty',true,'ESP-0025') on conflict (slug) do update set taxonomy_type='specialty',is_active=true,code=coalesce(public.categories.code,excluded.code);

-- Repoint any future/existing professional links defensively before retiring legacy entries.
with mappings(old_slug,new_slug) as (values
 ('coach-online','consulta-online'),
 ('especialista-sono','sono-recuperacao'),
 ('especialista-gestao-stress','gestao-stress'),
 ('especialista-performance-mental','performance-mental'),
 ('especialista-compressao','compressao-recuperacao')
), ids as (
 select old.id old_id,new.id new_id from mappings m join public.categories old on old.slug=m.old_slug join public.categories new on new.slug=m.new_slug
)
insert into public.professional_categories(professional_id,category_id)
select pc.professional_id,ids.new_id from public.professional_categories pc join ids on ids.old_id=pc.category_id
on conflict do nothing;

with mappings(old_slug,new_slug) as (values
 ('coach-online','consulta-online'),
 ('especialista-sono','sono-recuperacao'),
 ('especialista-gestao-stress','gestao-stress'),
 ('especialista-performance-mental','performance-mental'),
 ('especialista-compressao','compressao-recuperacao')
), ids as (
 select old.id old_id,new.id new_id from mappings m join public.categories old on old.slug=m.old_slug join public.categories new on new.slug=m.new_slug
)
delete from public.professional_categories pc using ids where pc.category_id=ids.old_id;

update public.categories set is_active=false where slug in ('coach-online','especialista-sono','especialista-gestao-stress','especialista-performance-mental','especialista-compressao');
