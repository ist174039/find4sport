-- Mirrors production migration 20260819024609 / consolidate_sensitive_read_rls.
-- Consolidate equivalent permissive SELECT policies and initialize auth.uid() once per query.

-- user_subscriptions: self or admin only.
drop policy if exists "Users can view their own subscriptions" on public.user_subscriptions;
drop policy if exists "Admins can view all subscriptions" on public.user_subscriptions;
drop policy if exists "user_subscriptions_read" on public.user_subscriptions;

create policy "user_subscriptions_read"
  on public.user_subscriptions
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.admins a
      where a.auth_user_id = (select auth.uid())
    )
  );

-- service_package_purchases: buyer or associated provider only.
drop policy if exists "service_package_purchases_self_read" on public.service_package_purchases;
drop policy if exists "service_package_purchases_provider_read" on public.service_package_purchases;
drop policy if exists "service_package_purchases_participant_read" on public.service_package_purchases;

create policy "service_package_purchases_participant_read"
  on public.service_package_purchases
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.professionals p
      where p.id = service_package_purchases.professional_id
        and p.user_id = (select auth.uid())
    )
  );

-- message_threads: only the two participants.
drop policy if exists "message_threads_participant_read" on public.message_threads;

create policy "message_threads_participant_read"
  on public.message_threads
  for select
  to authenticated
  using (
    athlete_id = (select auth.uid())
    or provider_user_id = (select auth.uid())
  );
