-- These compatibility RPCs return complete entity rows and have no callers
-- in the application repository. Keep them available only to trusted server
-- code until a narrow, reviewed public contract is needed.
begin;

revoke execute on function public.search_professionals_by_radius(double precision, double precision, double precision)
  from public, anon, authenticated;
revoke execute on function public.search_spaces_by_radius(double precision, double precision, double precision)
  from public, anon, authenticated;

grant execute on function public.search_professionals_by_radius(double precision, double precision, double precision)
  to service_role;
grant execute on function public.search_spaces_by_radius(double precision, double precision, double precision)
  to service_role;

commit;
