drop policy if exists "Professionals can manage their associations" on public.space_professionals;
drop policy if exists "Space owners can manage their associations" on public.space_professionals;
drop policy if exists "Public can read active space professionals" on public.space_professionals;

create policy space_professionals_public_read_active on public.space_professionals for select to anon using (status = 'active');

create policy space_professionals_authenticated_read on public.space_professionals for select to authenticated using (
  status = 'active'
  or exists (select 1 from public.professionals p where p.id = space_professionals.professional_id and p.user_id = (select auth.uid()))
  or exists (select 1 from public.sport_spaces s where s.id = space_professionals.space_id and s.owner_user_id = (select auth.uid()))
);
