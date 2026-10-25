-- This aggregate currently runs as the function owner and is exposed to every
-- API role. No product client calls it; keep it internal until a narrowly
-- scoped public event-count contract is designed and validated.
revoke execute on function public.public_event_participant_count(uuid)
  from public, anon, authenticated;

grant execute on function public.public_event_participant_count(uuid)
  to service_role;
