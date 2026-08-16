begin;

update storage.buckets
set file_size_limit = case id when 'avatars' then 5242880 when 'events' then 8388608 else file_size_limit end,
    allowed_mime_types = case id
      when 'avatars' then array['image/jpeg','image/png','image/webp']::text[]
      when 'events' then array['image/jpeg','image/png','image/webp']::text[]
      else allowed_mime_types
    end
where id in ('avatars','events');

drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Users can upload avatars" on storage.objects;
drop policy if exists "Users can update avatars" on storage.objects;
drop policy if exists "Users can delete avatars" on storage.objects;
drop policy if exists "Users can update own avatar" on storage.objects;
drop policy if exists "Users can delete own avatar" on storage.objects;
drop policy if exists "Utilizadores autenticados podem inserir imagens em events" on storage.objects;
drop policy if exists "O utilizador pode alterar as próprias imagens de eventos" on storage.objects;
drop policy if exists "O utilizador pode apagar as próprias imagens de eventos" on storage.objects;

create policy "avatars_owner_insert" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_update" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_delete" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "events_owner_insert" on storage.objects for insert to authenticated
with check (bucket_id = 'events' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "events_owner_update" on storage.objects for update to authenticated
using (bucket_id = 'events' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'events' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "events_owner_delete" on storage.objects for delete to authenticated
using (bucket_id = 'events' and (storage.foldername(name))[1] = auth.uid()::text);

commit;
