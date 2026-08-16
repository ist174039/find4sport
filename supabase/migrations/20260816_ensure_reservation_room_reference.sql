BEGIN;

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS space_room_id uuid REFERENCES public.space_rooms(id) ON DELETE SET NULL;

-- Service-only and room-only reservations are both valid marketplace bookings.
ALTER TABLE public.reservations ALTER COLUMN professional_id DROP NOT NULL;
ALTER TABLE public.reservations ALTER COLUMN service_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_space_room_date
  ON public.reservations(space_room_id, date, start_time, end_time)
  WHERE space_room_id IS NOT NULL;

COMMIT;
