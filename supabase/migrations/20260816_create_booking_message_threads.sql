BEGIN;

CREATE TABLE IF NOT EXISTS public.message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.platform_users(id) ON DELETE RESTRICT,
  provider_user_id uuid NOT NULL REFERENCES public.platform_users(id) ON DELETE RESTRICT,
  context_type text NOT NULL CHECK (context_type IN ('reservation','event_participant')),
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  event_participant_id uuid REFERENCES public.event_participants(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (context_type='reservation' AND reservation_id IS NOT NULL AND event_participant_id IS NULL)
    OR
    (context_type='event_participant' AND event_participant_id IS NOT NULL AND reservation_id IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_message_thread_reservation ON public.message_threads(reservation_id) WHERE reservation_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_message_thread_event_participant ON public.message_threads(event_participant_id) WHERE event_participant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_message_threads_participants ON public.message_threads(athlete_id,provider_user_id,status);

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS thread_id uuid REFERENCES public.message_threads(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_messages_thread_created ON public.messages(thread_id,created_at);

ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS message_threads_participant_read ON public.message_threads;
CREATE POLICY message_threads_participant_read ON public.message_threads
FOR SELECT TO authenticated USING (auth.uid() IN (athlete_id,provider_user_id));

COMMIT;
