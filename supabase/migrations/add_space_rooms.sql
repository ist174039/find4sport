-- Tabela de Salas (Sub-espaços)
CREATE TABLE IF NOT EXISTS public.space_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES public.sport_spaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 1,
  price_per_hour NUMERIC NOT NULL DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para space_rooms
ALTER TABLE public.space_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode ler as salas" 
  ON public.space_rooms FOR SELECT USING (true);

CREATE POLICY "Apenas gestores de espaço podem gerir as suas salas"
  ON public.space_rooms FOR ALL
  USING (space_id IN (SELECT id FROM public.sport_spaces WHERE owner_user_id = auth.uid() OR created_by = auth.uid()));


-- Tabela de Disponibilidade das Salas
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

-- Habilitar RLS para space_room_availability
ALTER TABLE public.space_room_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode ler a disponibilidade das salas" 
  ON public.space_room_availability FOR SELECT USING (true);

CREATE POLICY "Apenas gestores de espaço podem gerir a disponibilidade das suas salas"
  ON public.space_room_availability FOR ALL
  USING (room_id IN (SELECT id FROM public.space_rooms WHERE space_id IN (SELECT id FROM public.sport_spaces WHERE owner_user_id = auth.uid() OR created_by = auth.uid())));


-- Alterar Tabela de Reservas
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS space_room_id UUID REFERENCES public.space_rooms(id) ON DELETE SET NULL;
ALTER TABLE public.reservations ALTER COLUMN professional_id DROP NOT NULL;
ALTER TABLE public.reservations ALTER COLUMN service_id DROP NOT NULL;


-- Tabela de Inscrições em Eventos
DO $$ BEGIN
  CREATE TYPE event_registration_status AS ENUM ('pending', 'confirmed', 'paid', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.platform_users(id) ON DELETE CASCADE,
  status event_registration_status DEFAULT 'pending',
  stripe_session_id TEXT,
  payment_status TEXT DEFAULT 'pending', 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Habilitar RLS para event_registrations
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilizadores podem ver as suas inscrições" 
  ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organizadores de evento podem ver os inscritos"
  ON public.event_registrations FOR SELECT 
  USING (event_id IN (SELECT id FROM public.events WHERE created_by = auth.uid()));

CREATE POLICY "Utilizadores podem criar inscrições" 
  ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem cancelar inscrições" 
  ON public.event_registrations FOR UPDATE USING (auth.uid() = user_id);
