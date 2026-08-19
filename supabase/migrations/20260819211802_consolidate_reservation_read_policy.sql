drop policy if exists reservations_customer_read on public.reservations;
drop policy if exists reservations_professional_read on public.reservations;
drop policy if exists reservations_space_owner_read on public.reservations;

create policy reservations_participant_read
on public.reservations
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1
    from public.professionals p
    where p.id = reservations.professional_id
      and p.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.sport_spaces s
    where s.id = reservations.space_id
      and s.owner_user_id = (select auth.uid())
  )
);
