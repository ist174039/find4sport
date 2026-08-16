BEGIN;

CREATE TABLE IF NOT EXISTS public.service_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  sessions_count integer NOT NULL CHECK (sessions_count BETWEEN 2 AND 100),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  validity_days integer CHECK (validity_days IS NULL OR validity_days BETWEEN 1 AND 730),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_service_packages_professional ON public.service_packages(professional_id,is_active,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_packages_service ON public.service_packages(service_id,is_active);
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_packages_public_read ON public.service_packages;
CREATE POLICY service_packages_public_read ON public.service_packages FOR SELECT TO anon,authenticated USING (is_active);

INSERT INTO public.plan_entitlements(plan_id,feature_key,value_type,boolean_value,is_unlimited,description)
SELECT id,'services.packages.enabled','boolean',(code='premium'),false,'Criar e vender pacotes de sessões/aulas'
FROM public.subscription_plans
WHERE audience='professional'
ON CONFLICT(plan_id,feature_key) DO UPDATE SET boolean_value=EXCLUDED.boolean_value,description=EXCLUDED.description,updated_at=now();

COMMIT;
