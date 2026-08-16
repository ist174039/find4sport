BEGIN;

ALTER TABLE public.stripe_webhook_events
  ADD COLUMN IF NOT EXISTS event_participant_id uuid NULL,
  ADD COLUMN IF NOT EXISTS service_package_purchase_id uuid NULL,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text NULL,
  ADD COLUMN IF NOT EXISTS stripe_connected_account_id text NULL,
  ADD COLUMN IF NOT EXISTS financial_metadata jsonb NULL;

CREATE INDEX IF NOT EXISTS stripe_webhook_events_payment_intent_idx
  ON public.stripe_webhook_events(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS stripe_webhook_events_connected_account_idx
  ON public.stripe_webhook_events(stripe_connected_account_id)
  WHERE stripe_connected_account_id IS NOT NULL;

COMMIT;
