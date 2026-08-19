alter extension btree_gist set schema extensions;

revoke all on function public.enforce_event_participant_capacity() from public;
revoke all on function public.enforce_event_participant_capacity() from anon;
revoke all on function public.enforce_event_participant_capacity() from authenticated;
grant execute on function public.enforce_event_participant_capacity() to postgres;
