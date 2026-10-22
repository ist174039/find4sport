create or replace function public.enforce_provider_identity()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_user_role public.user_role;
begin
  if tg_table_name='professionals' then
    select type into v_user_role from public.platform_users where id=new.user_id for update;
    if v_user_role='venue_manager'::public.user_role then
      raise exception 'A venue manager account cannot also own a professional profile';
    end if;
    if v_user_role is distinct from 'professional'::public.user_role then
      update public.platform_users set type='professional',updated_at=now() where id=new.user_id;
    end if;
  elsif tg_table_name='sport_spaces' and new.owner_user_id is not null then
    select type into v_user_role from public.platform_users where id=new.owner_user_id for update;
    if v_user_role='professional'::public.user_role then
      raise exception 'A professional account cannot also own a venue with the current single-role model';
    end if;
    if v_user_role is distinct from 'venue_manager'::public.user_role then
      update public.platform_users set type='venue_manager',updated_at=now() where id=new.owner_user_id;
    end if;
  end if;
  return new;
end $$;
revoke all on function public.enforce_provider_identity() from public,anon,authenticated;
grant execute on function public.enforce_provider_identity() to postgres;
