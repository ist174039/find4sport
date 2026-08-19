-- Mirrors production migration 20260819024908 / make_contact_messages_direct_denial_explicit.
-- contact_messages is only accessed through trusted server-side code using service role.
-- Explicit deny policies document and enforce that direct anon/authenticated access is forbidden.

drop policy if exists "contact_messages_no_direct_select" on public.contact_messages;
drop policy if exists "contact_messages_no_direct_insert" on public.contact_messages;
drop policy if exists "contact_messages_no_direct_update" on public.contact_messages;
drop policy if exists "contact_messages_no_direct_delete" on public.contact_messages;

create policy "contact_messages_no_direct_select"
  on public.contact_messages
  for select
  to anon, authenticated
  using (false);

create policy "contact_messages_no_direct_insert"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (false);

create policy "contact_messages_no_direct_update"
  on public.contact_messages
  for update
  to anon, authenticated
  using (false)
  with check (false);

create policy "contact_messages_no_direct_delete"
  on public.contact_messages
  for delete
  to anon, authenticated
  using (false);
