BEGIN;

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL CHECK (code IN ('free','pro','premium')),
  name text NOT NULL,
  audience text NOT NULL CHECK (audience IN ('professional','venue_manager')),
  description text,
  monthly_price numeric(10,2) NOT NULL DEFAULT 0 CHECK (monthly_price >= 0),
  annual_price numeric(10,2) NOT NULL DEFAULT 0 CHECK (annual_price >= 0),
  commission_rate numeric(5,2) NOT NULL DEFAULT 0 CHECK (commission_rate BETWEEN 0 AND 100),
  customer_service_fee_rate numeric(5,2) NOT NULL DEFAULT 0 CHECK (customer_service_fee_rate BETWEEN 0 AND 100),
  stripe_product_id text,
  stripe_monthly_price_id text,
  stripe_annual_price_id text,
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (audience, code)
);

CREATE TABLE IF NOT EXISTS public.plan_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  value_type text NOT NULL CHECK (value_type IN ('boolean','integer','decimal','text','json')),
  boolean_value boolean,
  integer_value bigint,
  decimal_value numeric(14,4),
  text_value text,
  json_value jsonb,
  is_unlimited boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, feature_key),
  CHECK (
    is_unlimited OR
    (value_type='boolean' AND boolean_value IS NOT NULL) OR
    (value_type='integer' AND integer_value IS NOT NULL) OR
    (value_type='decimal' AND decimal_value IS NOT NULL) OR
    (value_type='text' AND text_value IS NOT NULL) OR
    (value_type='json' AND json_value IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS public.user_entitlement_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.platform_users(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  value_type text NOT NULL CHECK (value_type IN ('boolean','integer','decimal','text','json')),
  boolean_value boolean,
  integer_value bigint,
  decimal_value numeric(14,4),
  text_value text,
  json_value jsonb,
  is_unlimited boolean NOT NULL DEFAULT false,
  expires_at timestamptz,
  reason text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature_key)
);

CREATE TABLE IF NOT EXISTS public.feature_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.platform_users(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  period_type text NOT NULL CHECK (period_type IN ('day','month','lifetime')),
  period_start date NOT NULL,
  usage_count bigint NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature_key, period_type, period_start)
);

CREATE TABLE IF NOT EXISTS public.plan_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  change_type text NOT NULL,
  field_name text,
  old_value jsonb,
  new_value jsonb,
  effective_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.subscription_plans(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_subscription_plans_audience_active ON public.subscription_plans(audience, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_plan_entitlements_plan ON public.plan_entitlements(plan_id);
CREATE INDEX IF NOT EXISTS idx_overrides_user_active ON public.user_entitlement_overrides(user_id, feature_key, expires_at);
CREATE INDEX IF NOT EXISTS idx_feature_usage_lookup ON public.feature_usage(user_id, feature_key, period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_plan_history_plan_created ON public.plan_change_history(plan_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);

INSERT INTO public.subscription_plans (code,name,audience,description,monthly_price,annual_price,commission_rate,sort_order) VALUES
('free','Grátis','professional','Perfeito para começar',0,0,15,10),
('pro','Pro','professional','Para profissionais a sério',9.99,95.90,10,20),
('premium','Premium','professional','Para profissionais de topo',19.99,191.90,5,30),
('free','Grátis','venue_manager','Base para começar a gerir um espaço',0,0,15,10),
('pro','Pro','venue_manager','Para espaços com operação regular',9.99,95.90,10,20),
('premium','Premium','venue_manager','Para espaços com operação avançada',19.99,191.90,5,30)
ON CONFLICT (audience,code) DO NOTHING;

WITH feature_values(feature_key,value_type,free_value,pro_value,premium_value,free_unlimited,pro_unlimited,premium_unlimited,description) AS (VALUES
('profile.photos.max','integer','5','0','0',false,true,true,'Número máximo de fotos no perfil/galeria'),
('posts.monthly.max','integer','10','100','0',false,false,true,'Publicações por mês'),
('posts.images_per_post.max','integer','3','10','20',false,false,false,'Fotos por publicação'),
('chat.enabled','boolean','true','true','true',false,false,false,'Acesso ao chat'),
('chat.new_conversations_daily.max','integer','5','30','0',false,false,true,'Novas conversas por dia'),
('chat.messages_daily.max','integer','100','1000','0',false,false,true,'Mensagens por dia'),
('chat.attachments.enabled','boolean','false','true','true',false,false,false,'Anexos no chat'),
('communities.create.enabled','boolean','false','true','true',false,false,false,'Criar comunidades'),
('communities.max','integer','0','3','10',false,false,false,'Número máximo de comunidades'),
('communities.members.max','integer','0','500','5000',false,false,false,'Membros máximos por comunidade'),
('feed.create.enabled','boolean','true','true','true',false,false,false,'Criar publicações no feed'),
('feed.posts_daily.max','integer','2','10','0',false,false,true,'Publicações de feed por dia'),
('feed.video.enabled','boolean','false','true','true',false,false,false,'Publicar vídeo no feed'),
('services.max','integer','3','20','0',false,false,true,'Número máximo de serviços ativos'),
('events.create.enabled','boolean','false','true','true',false,false,false,'Criar eventos'),
('analytics.advanced.enabled','boolean','false','true','true',false,false,false,'Analytics avançado'),
('profile.featured.enabled','boolean','false','false','true',false,false,false,'Perfil/espaço destacado'),
('search.priority','text','normal','high','highest',false,false,false,'Prioridade nos resultados de pesquisa'))
INSERT INTO public.plan_entitlements(plan_id,feature_key,value_type,boolean_value,integer_value,text_value,is_unlimited,description)
SELECT p.id,f.feature_key,f.value_type,
CASE WHEN f.value_type='boolean' THEN CASE p.code WHEN 'free' THEN f.free_value::boolean WHEN 'pro' THEN f.pro_value::boolean ELSE f.premium_value::boolean END END,
CASE WHEN f.value_type='integer' THEN CASE p.code WHEN 'free' THEN f.free_value::bigint WHEN 'pro' THEN f.pro_value::bigint ELSE f.premium_value::bigint END END,
CASE WHEN f.value_type='text' THEN CASE p.code WHEN 'free' THEN f.free_value WHEN 'pro' THEN f.pro_value ELSE f.premium_value END END,
CASE p.code WHEN 'free' THEN f.free_unlimited WHEN 'pro' THEN f.pro_unlimited ELSE f.premium_unlimited END,
f.description
FROM public.subscription_plans p
CROSS JOIN feature_values f
ON CONFLICT (plan_id,feature_key) DO NOTHING;

UPDATE public.user_subscriptions us
SET plan_id = p.id
FROM public.platform_users pu, public.subscription_plans p
WHERE pu.id = us.user_id
  AND p.audience = pu.type::text
  AND p.code = us.tier::text
  AND pu.type::text IN ('professional','venue_manager')
  AND us.plan_id IS NULL;

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlement_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_change_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscription_plans_public_read ON public.subscription_plans;
CREATE POLICY subscription_plans_public_read ON public.subscription_plans FOR SELECT TO anon,authenticated USING (is_active AND is_public);

DROP POLICY IF EXISTS plan_entitlements_public_read ON public.plan_entitlements;
CREATE POLICY plan_entitlements_public_read ON public.plan_entitlements FOR SELECT TO anon,authenticated USING (
  EXISTS (SELECT 1 FROM public.subscription_plans p WHERE p.id=plan_entitlements.plan_id AND p.is_active AND p.is_public)
);

DROP POLICY IF EXISTS entitlement_overrides_self_read ON public.user_entitlement_overrides;
CREATE POLICY entitlement_overrides_self_read ON public.user_entitlement_overrides FOR SELECT TO authenticated USING (user_id=(SELECT auth.uid()));

DROP POLICY IF EXISTS feature_usage_self_read ON public.feature_usage;
CREATE POLICY feature_usage_self_read ON public.feature_usage FOR SELECT TO authenticated USING (user_id=(SELECT auth.uid()));

COMMIT;
