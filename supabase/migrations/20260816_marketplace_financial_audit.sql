BEGIN;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS source_id uuid,
  ADD COLUMN IF NOT EXISTS provider_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_connected_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_transfer_id text,
  ADD COLUMN IF NOT EXISTS gross_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS base_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS customer_fee_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS platform_commission_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS application_fee_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS stripe_processing_fee_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS provider_net_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS platform_net_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS commission_rate numeric(7,4),
  ADD COLUMN IF NOT EXISTS customer_fee_rate numeric(7,4),
  ADD COLUMN IF NOT EXISTS financial_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_transactions_source ON public.transactions(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider ON public.transactions(provider_user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_payment_intent_unique
  ON public.transactions(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

COMMIT;
