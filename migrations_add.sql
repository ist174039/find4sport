CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'paid', 'cancelled', 'completed');

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

CREATE POLICY "Anyone can read professional_availability" 
  ON public.professional_availability FOR SELECT USING (true);

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

CREATE POLICY "Users can view their own reservations" 
  ON public.reservations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Professionals can view their reservations" 
  ON public.reservations FOR SELECT 
  USING (professional_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Professionals can update their reservations"
  ON public.reservations FOR UPDATE
  USING (professional_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid()));
