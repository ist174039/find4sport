drop policy if exists "Restricted profiles are not public" on public.platform_users;
create policy "Restricted profiles are not public"
  on public.platform_users as restrictive for select to anon, authenticated
  using (
    account_status = 'active'
    or (account_status = 'suspended' and suspended_until <= now())
    or (select auth.uid()) = id
  );

drop policy if exists "Restricted professionals are not public" on public.professionals;
create policy "Restricted professionals are not public"
  on public.professionals as restrictive for select to anon, authenticated
  using (exists (
    select 1 from public.platform_users pu
    where pu.id = professionals.user_id
      and (pu.account_status = 'active' or (pu.account_status = 'suspended' and pu.suspended_until <= now()))
  ));
