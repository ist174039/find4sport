-- Event creation is server-mediated by createEventAction/createAdminEventAction.
-- Generic browser roles must not be able to bypass role, entitlement, category,
-- paid-event and moderation checks with a direct PostgREST INSERT.
begin;

drop policy if exists "Authenticated users can create events" on public.events;
revoke insert on table public.events from anon, authenticated;

commit;
