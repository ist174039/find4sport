drop policy if exists "Admins can read own profile" on public.admins;
drop policy if exists "General admins can read all admins" on public.admins;

create policy admins_authenticated_read
on public.admins
for select
to authenticated
using (
  auth_user_id = (select auth.uid())
  or private.is_admin_general()
);
