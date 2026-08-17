-- Normalize legacy events whose schedule is over but status was never advanced.
UPDATE public.events
SET status = 'completed'::public.event_status,
    updated_at = now()
WHERE status = 'published'::public.event_status
  AND coalesce(end_date, start_date) < now();
