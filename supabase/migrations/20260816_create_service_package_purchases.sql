BEGIN;

CREATE TABLE IF NOT EXISTS public.service_package_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.platform_users(id) ON DELETE RESTRICT,
  package_id uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE RESTRICT,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  sessions_total integer NOT NULL CHECK (sessions_total > 0),
  sessions_remaining integer NOT NULL CHECK (sessions_remaining >= 0),
  price_paid numeric(10,2) NOT NULL CHECK (price_paid >= 0),
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','exhausted','expired','refunded','cancelled')),
  purchased_at timestamptz,
  expires_at timestamptz,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS package_purchase_id uuid REFERENCES public.service_package_purchases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS package_session_consumed boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_service_package_purchases_user ON public.service_package_purchases(user_id,status,expires_at);
CREATE INDEX IF NOT EXISTS idx_service_package_purchases_professional ON public.service_package_purchases(professional_id,status);
CREATE INDEX IF NOT EXISTS idx_service_package_purchases_service ON public.service_package_purchases(service_id,status);
CREATE INDEX IF NOT EXISTS idx_reservations_package_purchase ON public.reservations(package_purchase_id);

ALTER TABLE public.service_package_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_package_purchases_self_read ON public.service_package_purchases;
CREATE POLICY service_package_purchases_self_read ON public.service_package_purchases
FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS service_package_purchases_provider_read ON public.service_package_purchases;
CREATE POLICY service_package_purchases_provider_read ON public.service_package_purchases
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.professionals p
    WHERE p.id = service_package_purchases.professional_id AND p.user_id = auth.uid()
  )
);

COMMIT;
