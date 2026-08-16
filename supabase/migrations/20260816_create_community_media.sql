create table if not exists public.community_media (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  caption text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists community_media_community_created_idx on public.community_media(community_id, created_at desc);

alter table public.community_media enable row level security;

drop policy if exists community_media_select on public.community_media;
create policy community_media_select on public.community_media
for select using (
  exists (
    select 1 from public.communities c
    where c.id = community_media.community_id
      and (
        c.is_private = false
        or exists (
          select 1 from public.community_members cm
          where cm.community_id = c.id and cm.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists community_media_admin_insert on public.community_media;
create policy community_media_admin_insert on public.community_media
for insert to authenticated
with check (
  uploaded_by = auth.uid()
  and exists (
    select 1 from public.community_members cm
    where cm.community_id = community_media.community_id
      and cm.user_id = auth.uid()
      and cm.role = 'admin'
  )
);

drop policy if exists community_media_admin_delete on public.community_media;
create policy community_media_admin_delete on public.community_media
for delete to authenticated
using (
  exists (
    select 1 from public.community_members cm
    where cm.community_id = community_media.community_id
      and cm.user_id = auth.uid()
      and cm.role = 'admin'
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-media', 'community-media', false, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists community_media_storage_read on storage.objects;
create policy community_media_storage_read on storage.objects
for select using (
  bucket_id = 'community-media'
  and exists (
    select 1 from public.communities c
    where c.id::text = (storage.foldername(name))[1]
      and (
        c.is_private = false
        or exists (
          select 1 from public.community_members cm
          where cm.community_id = c.id and cm.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists community_media_storage_insert on storage.objects;
create policy community_media_storage_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'community-media'
  and exists (
    select 1 from public.community_members cm
    where cm.community_id::text = (storage.foldername(name))[1]
      and cm.user_id = auth.uid()
      and cm.role = 'admin'
  )
);

drop policy if exists community_media_storage_delete on storage.objects;
create policy community_media_storage_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'community-media'
  and exists (
    select 1 from public.community_members cm
    where cm.community_id::text = (storage.foldername(name))[1]
      and cm.user_id = auth.uid()
      and cm.role = 'admin'
  )
);
