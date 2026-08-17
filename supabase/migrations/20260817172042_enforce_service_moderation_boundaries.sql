drop policy if exists "Services readable by everyone" on public.services;
create policy "Approved services are public" on public.services for select using (moderation_status='approved' and is_active=true or exists(select 1 from public.professionals p where p.id=professional_id and p.user_id=auth.uid()) or public.is_admin());
drop policy if exists "Professionals can update own services" on public.services;
drop policy if exists "Users can update own reservations" on public.reservations;
alter table public.service_moderation_events enable row level security;
alter table public.reservation_delivery_events enable row level security;
create policy "Admins read moderation events" on public.service_moderation_events for select using (public.is_admin());
create policy "Reservation parties read delivery events" on public.reservation_delivery_events for select using (exists(select 1 from public.reservations r where r.id=reservation_id and (r.user_id=auth.uid() or public.reservation_provider_user(r.professional_id,r.space_id)=auth.uid() or public.is_admin())));
