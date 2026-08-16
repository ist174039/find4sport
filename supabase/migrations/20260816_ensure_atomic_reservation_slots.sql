BEGIN;

-- Keep this migration self-contained: the exclusivity trigger references space_room_id,
-- so ensure the room relation exists before the function/trigger is installed.
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS space_room_id uuid REFERENCES public.space_rooms(id) ON DELETE SET NULL;
ALTER TABLE public.reservations ALTER COLUMN professional_id DROP NOT NULL;
ALTER TABLE public.reservations ALTER COLUMN service_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_space_room_date
  ON public.reservations(space_room_id, date, start_time, end_time)
  WHERE space_room_id IS NOT NULL;

-- Serialize booking writes per resource/day so concurrent requests cannot both pass
-- the overlap check. This protects every writer, not only the Next.js booking flow.
CREATE OR REPLACE FUNCTION public.enforce_reservation_slot_exclusivity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  professional_key bigint;
  room_key bigint;
  conflict_id uuid;
BEGIN
  IF new.status NOT IN ('pending', 'paid', 'confirmed') THEN
    RETURN new;
  END IF;

  IF new.start_time IS NULL OR new.end_time IS NULL OR new.date IS NULL OR new.start_time >= new.end_time THEN
    RAISE EXCEPTION USING errcode = '23514', message = 'invalid_reservation_interval';
  END IF;

  IF new.professional_id IS NOT NULL THEN
    professional_key := hashtextextended('professional:' || new.professional_id::text || ':' || new.date::text, 0);
  END IF;
  IF new.space_room_id IS NOT NULL THEN
    room_key := hashtextextended('room:' || new.space_room_id::text || ':' || new.date::text, 0);
  END IF;

  -- Always acquire multiple locks in numeric order to avoid lock inversion/deadlocks.
  IF professional_key IS NOT NULL AND room_key IS NOT NULL THEN
    IF professional_key <= room_key THEN
      PERFORM pg_advisory_xact_lock(professional_key);
      PERFORM pg_advisory_xact_lock(room_key);
    ELSE
      PERFORM pg_advisory_xact_lock(room_key);
      PERFORM pg_advisory_xact_lock(professional_key);
    END IF;
  ELSIF professional_key IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(professional_key);
  ELSIF room_key IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(room_key);
  END IF;

  SELECT r.id
    INTO conflict_id
    FROM public.reservations r
   WHERE r.date = new.date
     AND r.status IN ('pending', 'paid', 'confirmed')
     AND r.id IS DISTINCT FROM new.id
     AND r.start_time < new.end_time
     AND r.end_time > new.start_time
     AND (
       (new.professional_id IS NOT NULL AND r.professional_id = new.professional_id)
       OR
       (new.space_room_id IS NOT NULL AND r.space_room_id = new.space_room_id)
     )
   LIMIT 1;

  IF conflict_id IS NOT NULL THEN
    RAISE EXCEPTION USING errcode = '23P01', message = 'reservation_slot_conflict';
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS reservations_enforce_slot_exclusivity ON public.reservations;
CREATE TRIGGER reservations_enforce_slot_exclusivity
BEFORE INSERT OR UPDATE OF date, start_time, end_time, status, professional_id, space_room_id
ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.enforce_reservation_slot_exclusivity();

COMMIT;
