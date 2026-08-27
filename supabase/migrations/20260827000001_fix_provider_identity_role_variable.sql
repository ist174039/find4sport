create or replace function public.enforce_provider_identity()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_user_role public.user_role;
begin
  if tg_table_name='professionals' then
    select type into v_user_role from public.platform_users where id=new.user_id for update;
    if v_user_role::text = 'athlete' then
      update public.platform_users set type='professional',updated_at=now() where id=new.user_id;
    end if;
  elsif tg_table_name='sport_spaces' and new.owner_user_id is not null then
    select type into v_user_role from public.platform_users where id=new.owner_user_id for update;
    if v_user_role::text = 'athlete' then
      update public.platform_users set type='venue_manager',updated_at=now() where id=new.owner_user_id;
    end if;
  end if;
  return new;
end $$;

revoke all on function public.enforce_provider_identity() from public,anon,authenticated;
grant execute on function public.enforce_provider_identity() to postgres;

with latest_approved as (
  select distinct on (space_id) space_id, user_id
  from public.space_claims
  where status = 'approved' and space_id is not null and user_id is not null
  order by space_id, created_at desc nulls last
)
update public.sport_spaces s
set owner_user_id = c.user_id,
    is_verified = true,
    claimed_at = coalesce(s.claimed_at, now()),
    updated_at = now()
from latest_approved c
where s.id = c.space_id and s.owner_user_id is null;
