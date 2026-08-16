BEGIN;

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_type_check CHECK (
    type = ANY (ARRAY[
      'subscription_payment'::text,
      'service_reservation_payment'::text,
      'space_reservation_payment'::text,
      'service_package_payment'::text,
      'event_payment'::text,
      'reservation_payout'::text,
      'refund'::text,
      'dispute'::text,
      'payout'::text,
      'transfer_reversal'::text
    ])
  );

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS related_transaction_id uuid NULL REFERENCES public.transactions(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS transactions_stripe_charge_unique_idx
  ON public.transactions(stripe_charge_id)
  WHERE stripe_charge_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS transactions_related_transaction_idx
  ON public.transactions(related_transaction_id)
  WHERE related_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS transactions_provider_created_idx
  ON public.transactions(provider_user_id, created_at DESC)
  WHERE provider_user_id IS NOT NULL;

COMMIT;
