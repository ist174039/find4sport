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

