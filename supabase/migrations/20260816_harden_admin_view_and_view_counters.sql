alter view public.admin_users set (security_invoker = true);

revoke execute on function public.increment_professional_views(uuid) from public, anon, authenticated;
revoke execute on function public.increment_space_views(uuid) from public, anon, authenticated;
grant execute on function public.increment_professional_views(uuid) to service_role;
grant execute on function public.increment_space_views(uuid) to service_role;
