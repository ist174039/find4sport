DO $$ BEGIN
  CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'paid', 'cancelled', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.professional_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL, -- 0=Sunday, 1=Monday...
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(professional_id, day_of_week)
);

ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read professional_availability" ON public.professional_availability;
CREATE POLICY "Anyone can read professional_availability" 
  ON public.professional_availability FOR SELECT USING (true);

DROP POLICY IF EXISTS "Professionals can manage their availability" ON public.professional_availability;
CREATE POLICY "Professionals can manage their availability"
  ON public.professional_availability FOR ALL
  USING (professional_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.platform_users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  space_id UUID REFERENCES public.sport_spaces(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status reservation_status DEFAULT 'pending',
  amount NUMERIC NOT NULL,
  stripe_session_id TEXT,
  payment_status TEXT DEFAULT 'pending', 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
CREATE POLICY "Users can view their own reservations" 
  ON public.reservations FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Professionals can view their reservations" ON public.reservations;
CREATE POLICY "Professionals can view their reservations" 
  ON public.reservations FOR SELECT 
  USING (professional_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own reservations" ON public.reservations;
CREATE POLICY "Users can insert their own reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Professionals can update their reservations" ON public.reservations;
CREATE POLICY "Professionals can update their reservations"
  ON public.reservations FOR UPDATE
  USING (professional_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid()));

-- ========================================
-- SPACE ROOMS (Salas / Campos)
-- ========================================

CREATE TABLE IF NOT EXISTS public.space_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.sport_spaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INT DEFAULT 1,
  price_per_hour NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  gallery_urls TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.space_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active space_rooms" ON public.space_rooms;
CREATE POLICY "Anyone can read active space_rooms"
  ON public.space_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Space owners can manage their rooms" ON public.space_rooms;
CREATE POLICY "Space owners can manage their rooms"
  ON public.space_rooms FOR ALL
  USING (space_id IN (SELECT id FROM public.sport_spaces WHERE owner_user_id = auth.uid()));

-- ========================================
-- SPACE ROOM AVAILABILITY
-- ========================================

CREATE TABLE IF NOT EXISTS public.space_room_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.space_rooms(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL, -- 0=Sunday, 1=Monday...
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_id, day_of_week)
);

ALTER TABLE public.space_room_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read room availability" ON public.space_room_availability;
CREATE POLICY "Anyone can read room availability"
  ON public.space_room_availability FOR SELECT USING (true);

DROP POLICY IF EXISTS "Space owners can manage room availability" ON public.space_room_availability;
CREATE POLICY "Space owners can manage room availability"
  ON public.space_room_availability FOR ALL
  USING (room_id IN (
    SELECT sr.id FROM public.space_rooms sr 
    JOIN public.sport_spaces ss ON sr.space_id = ss.id 
    WHERE ss.owner_user_id = auth.uid()
  ));

-- ========================================
-- FIX: SPORT_SPACES RLS POLICIES
-- Garante que:
--   1. Público vê espaços com status 'active' ou 'published'
--   2. O owner vê/edita o seu próprio espaço (mesmo pending)
--   3. Admins (via tabela admins) vêem todos
--   4. INSERT permitido para utilizadores autenticados
-- ========================================

ALTER TABLE public.sport_spaces ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas que possam estar a bloquear
DROP POLICY IF EXISTS "Anyone can view spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Anyone can view active spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Public can view active spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Owners can view their spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Owners can update their spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Owners can insert spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Admins can view all spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Admins can manage all spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Authenticated users can insert spaces" ON public.sport_spaces;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.sport_spaces;
DROP POLICY IF EXISTS "sport_spaces_select_policy" ON public.sport_spaces;
DROP POLICY IF EXISTS "sport_spaces_insert_policy" ON public.sport_spaces;
DROP POLICY IF EXISTS "sport_spaces_update_policy" ON public.sport_spaces;
DROP POLICY IF EXISTS "sport_spaces_delete_policy" ON public.sport_spaces;

-- 1. Qualquer pessoa pode VER espaços activos (listagens públicas)
CREATE POLICY "Public can view active spaces"
  ON public.sport_spaces FOR SELECT
  USING (
    status = 'active'
    OR is_verified = true
  );

-- 2. O owner/criador pode ver E editar o seu próprio espaço (mesmo pending)
CREATE POLICY "Owners can view their spaces"
  ON public.sport_spaces FOR SELECT
  USING (
    auth.uid() = owner_user_id 
    OR auth.uid() = created_by
  );

CREATE POLICY "Owners can update their spaces"
  ON public.sport_spaces FOR UPDATE
  USING (
    auth.uid() = owner_user_id 
    OR auth.uid() = created_by
  );

-- 3. Admins vêem TODOS os espaços (para o painel admin)
CREATE POLICY "Admins can view all spaces"
  ON public.sport_spaces FOR SELECT
  USING (
    auth.uid() IN (SELECT auth_user_id FROM public.admins)
  );

CREATE POLICY "Admins can manage all spaces"
  ON public.sport_spaces FOR ALL
  USING (
    auth.uid() IN (SELECT auth_user_id FROM public.admins)
  );

-- 4. Utilizadores autenticados podem criar espaços
CREATE POLICY "Authenticated users can insert spaces"
  ON public.sport_spaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ========================================
-- BILLING AND SUBSCRIPTIONS
-- ========================================

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'premium');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid', 'paused');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.platform_users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status subscription_status,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() IN (SELECT auth_user_id FROM public.admins));

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'eur',
    type TEXT NOT NULL CHECK (type IN ('subscription_payment', 'reservation_payout', 'refund')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    stripe_charge_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own transactions" ON public.transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can read all transactions" ON public.transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid())
);

-- Bidirectional association between Spaces and Professionals
CREATE TABLE IF NOT EXISTS public.space_professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID REFERENCES public.sport_spaces(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'rejected')),
    initiated_by TEXT NOT NULL CHECK (initiated_by IN ('space', 'professional')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(space_id, professional_id)
);

ALTER TABLE public.space_professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active space professionals" ON public.space_professionals FOR SELECT USING (status = 'active');
CREATE POLICY "Space owners can manage their associations" ON public.space_professionals
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.sport_spaces WHERE id = space_professionals.space_id AND owner_user_id = auth.uid())
    );
CREATE POLICY "Professionals can manage their associations" ON public.space_professionals
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.professionals WHERE id = space_professionals.professional_id AND user_id = auth.uid())
    );

-- Content Management System (CMS) for dynamic pages
CREATE TABLE IF NOT EXISTS public.cms_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published pages" ON public.cms_pages FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage all pages" ON public.cms_pages 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() IN (SELECT auth_user_id FROM public.admins));

-- Add Stripe Account ID for Connect
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE public.sport_spaces ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
