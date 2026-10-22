revoke update on table public.platform_users from authenticated;
grant update (full_name, avatar_url, banner_url, location, language, preferences) on table public.platform_users to authenticated;
