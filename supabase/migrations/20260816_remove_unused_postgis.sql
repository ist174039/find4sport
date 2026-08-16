begin;

create index if not exists professionals_lat_lng_idx
  on public.professionals(latitude, longitude)
  where latitude is not null and longitude is not null;

create index if not exists sport_spaces_lat_lng_idx
  on public.sport_spaces(latitude, longitude)
  where latitude is not null and longitude is not null;

create index if not exists events_lat_lng_idx
  on public.events(latitude, longitude)
  where latitude is not null and longitude is not null;

drop index if exists public.professionals_geom_idx;
drop index if exists public.sport_spaces_geom_idx;
drop index if exists public.events_geom_idx;

drop extension if exists postgis;

commit;
