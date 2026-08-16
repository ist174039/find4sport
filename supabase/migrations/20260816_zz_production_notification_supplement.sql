create or replace function public.notify_community_join_request() returns trigger
language plpgsql security definer set search_path=public as $$
declare c_name text; admin_id uuid;
begin
  select name into c_name from public.communities where id=new.community_id;
  if tg_op='INSERT' then
    for admin_id in select user_id from public.community_members where community_id=new.community_id and role='admin' loop
      if admin_id<>new.user_id then perform public.push_notification(admin_id,'community','Novo pedido para entrar em '||coalesce(c_name,'comunidade')||'.','/dashboard/comunidades/'||new.community_id::text,jsonb_build_object('community_id',new.community_id,'request_id',new.id),'community-join:'||new.id::text||':admin'); end if;
    end loop;
  elsif old.status is distinct from new.status then
    perform public.push_notification(new.user_id,'community',case new.status when 'approved' then 'O teu pedido para entrar em '||coalesce(c_name,'comunidade')||' foi aprovado.' when 'rejected' then 'O teu pedido para entrar em '||coalesce(c_name,'comunidade')||' foi recusado.' else 'O teu pedido de adesão foi atualizado.' end,'/comunidades/'||new.community_id::text,jsonb_build_object('community_id',new.community_id,'request_id',new.id,'status',new.status),'community-join:'||new.id::text||':'||new.status);
  end if;
  return new;
end $$;
drop trigger if exists notify_community_join_request on public.community_join_requests;
create trigger notify_community_join_request after insert or update of status on public.community_join_requests for each row execute function public.notify_community_join_request();
revoke all on function public.notify_community_join_request() from public,anon,authenticated;

create or replace function public.notify_transaction_insert() returns trigger
language plpgsql security definer set search_path=public as $$
declare msg text;
begin
  msg:=case when new.type in('refund','dispute','transfer_reversal') then case new.type when 'refund' then 'Foi registado um reembolso.' when 'dispute' then 'Foi registada uma disputa de pagamento.' else 'Foi registada uma reversão de transferência.' end when new.status='succeeded' then 'Pagamento confirmado.' when new.status='failed' then 'Um pagamento falhou.' else null end;
  if msg is null then return new; end if;
  if new.user_id is not null then perform public.push_notification(new.user_id,'billing',msg,'/dashboard/faturacao',jsonb_build_object('transaction_id',new.id,'type',new.type,'status',new.status),'transaction:'||new.id::text||':buyer'); end if;
  if new.provider_user_id is not null and new.provider_user_id is distinct from new.user_id then perform public.push_notification(new.provider_user_id,'billing',msg,'/dashboard/faturacao',jsonb_build_object('transaction_id',new.id,'type',new.type,'status',new.status),'transaction:'||new.id::text||':provider'); end if;
  return new;
end $$;
drop trigger if exists notify_transaction_insert on public.transactions;
create trigger notify_transaction_insert after insert on public.transactions for each row execute function public.notify_transaction_insert();
revoke all on function public.notify_transaction_insert() from public,anon,authenticated;

create or replace function public.sync_event_thread_status() returns trigger
language plpgsql security definer set search_path=public as $$
declare event_active boolean;
begin
  select coalesce(e.end_date,e.start_date+interval '1 day')>now() into event_active from public.events e where e.id=new.event_id;
  update public.message_threads set status=case when new.status in('paid','confirmed') and new.payment_status='paid' and event_active then 'active' else 'archived' end,archived_at=case when new.status in('paid','confirmed') and new.payment_status='paid' and event_active then null else now() end,updated_at=now() where event_participant_id=new.id;
  return new;
end $$;
drop trigger if exists sync_event_thread_status on public.event_participants;
create trigger sync_event_thread_status after update of status,payment_status on public.event_participants for each row execute function public.sync_event_thread_status();
revoke all on function public.sync_event_thread_status() from public,anon,authenticated;
