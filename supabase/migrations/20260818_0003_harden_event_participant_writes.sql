-- Production hardening: participant writes are server-controlled.

-- Enrollment and participant state changes are validated by server actions and
-- Stripe webhook handlers using the service-role client. Direct client writes
-- would bypass capacity, lifecycle and payment checks.
drop policy if exists "Users can insert their own event participations" on public.event_participants;
drop policy if exists "Users can cancel their own participations" on public.event_participants;
drop policy if exists "Event creators can update participant status" on public.event_participants;

drop policy if exists "Users can view their own event participations" on public.event_participants;
drop policy if exists "Event creators can view participants of their events" on public.event_participants;
create policy "event_participants_authorized_read"
on public.event_participants for select to authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1 from public.events e
    where e.id = event_participants.event_id
      and e.created_by = (select auth.uid())
  )
);
