alter table public.reservations drop constraint if exists reservations_settlement_status_check;
alter table public.reservations add constraint reservations_settlement_status_check check (settlement_status = any (array['not_applicable'::text,'held'::text,'eligible'::text,'processing'::text,'transferred'::text,'blocked'::text,'refunded'::text]));
