drop index if exists public.idx_transactions_payment_intent_unique;
create unique index idx_transactions_payment_intent_unique
  on public.transactions (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null
    and type in ('service_reservation_payment','space_reservation_payment','service_package_payment','event_payment');

create or replace function public.persist_refund_transaction_from_webhook_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  obj jsonb;
  v_refund_id text;
  v_charge_id text;
  v_payment_intent_id text;
  v_amount numeric;
  v_currency text;
  v_status text;
  v_reason text;
  v_original public.transactions%rowtype;
  v_existing_id uuid;
  v_original_gross numeric;
  v_ratio numeric;
  v_provider_impact numeric;
  v_platform_impact numeric;
begin
  if new.event_type not in ('refund.created','refund.updated','refund.failed') then
    return new;
  end if;

  obj := new.payload->'data'->'object';
  v_refund_id := nullif(obj->>'id','');
  v_charge_id := nullif(obj->>'charge','');
  v_payment_intent_id := nullif(obj->>'payment_intent','');
  v_amount := coalesce(nullif(obj->>'amount','')::numeric,0) / 100.0;
  v_currency := coalesce(nullif(obj->>'currency',''),'eur');
  v_reason := nullif(obj->>'reason','');
  v_status := case
    when new.event_type='refund.failed' or obj->>'status'='failed' then 'failed'
    when obj->>'status'='pending' then 'pending'
    else 'completed'
  end;

  if v_refund_id is null or v_amount <= 0 then
    return new;
  end if;

  select t.* into v_original
  from public.transactions t
  where t.type in ('service_reservation_payment','space_reservation_payment','service_package_payment','event_payment')
    and (
      (v_payment_intent_id is not null and t.stripe_payment_intent_id=v_payment_intent_id)
      or (v_charge_id is not null and t.stripe_charge_id=v_charge_id)
    )
  order by t.created_at asc
  limit 1;

  if v_original.id is null then
    return new;
  end if;

  v_original_gross := greatest(coalesce(v_original.gross_amount,v_original.amount,0),0.01);
  v_ratio := least(1, v_amount / v_original_gross);
  v_provider_impact := coalesce(v_original.provider_net_amount,0) * v_ratio;
  v_platform_impact := coalesce(v_original.platform_net_amount,0) * v_ratio;

  select id into v_existing_id
  from public.transactions
  where stripe_charge_id=v_refund_id
  limit 1;

  if v_existing_id is null then
    insert into public.transactions (
      user_id,provider_user_id,amount,gross_amount,base_amount,currency,type,status,
      source_type,source_id,related_transaction_id,stripe_charge_id,stripe_payment_intent_id,
      stripe_connected_account_id,stripe_transfer_id,provider_net_amount,platform_net_amount,financial_metadata
    ) values (
      coalesce(v_original.provider_user_id,v_original.user_id),null,v_amount,v_amount,v_amount,v_currency,'refund',v_status,
      v_original.source_type,v_original.source_id,v_original.id,v_refund_id,v_original.stripe_payment_intent_id,
      v_original.stripe_connected_account_id,v_original.stripe_transfer_id,v_provider_impact,v_platform_impact,
      jsonb_build_object(
        'refund_id',v_refund_id,
        'refund_reason',v_reason,
        'stripe_event_id',new.event_id,
        'original_charge_id',v_charge_id,
        'buyer_user_id',v_original.user_id,
        'provider_user_id',v_original.provider_user_id,
        'refund_ratio',v_ratio,
        'source','stripe_refund_event'
      )
    );
  else
    update public.transactions
    set status=v_status,
        amount=v_amount,
        gross_amount=v_amount,
        base_amount=v_amount,
        currency=v_currency,
        provider_net_amount=v_provider_impact,
        platform_net_amount=v_platform_impact,
        financial_metadata=jsonb_build_object(
          'refund_id',v_refund_id,
          'refund_reason',v_reason,
          'stripe_event_id',new.event_id,
          'original_charge_id',v_charge_id,
          'buyer_user_id',v_original.user_id,
          'provider_user_id',v_original.provider_user_id,
          'refund_ratio',v_ratio,
          'source','stripe_refund_event'
        )
    where id=v_existing_id;
  end if;

  return new;
end;
$$;

drop trigger if exists stripe_webhook_refund_to_ledger on public.stripe_webhook_events;
create trigger stripe_webhook_refund_to_ledger
after insert on public.stripe_webhook_events
for each row execute function public.persist_refund_transaction_from_webhook_event();
