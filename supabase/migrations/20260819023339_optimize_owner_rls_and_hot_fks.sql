-- Mirrors production migration 20260819023339 / optimize_owner_rls_and_hot_fks.
-- Keep public reads intact while restricting owner writes to authenticated users,
-- avoid per-row auth.uid() re-evaluation, and cover hot foreign-key paths.

create index if not exists qualifications_professional_id_idx
  on public.qualifications (professional_id);

create index if not exists professional_categories_category_id_idx
  on public.professional_categories (category_id);

create index if not exists space_categories_category_id_idx
  on public.space_categories (category_id);

create index if not exists community_join_requests_user_id_idx
  on public.community_join_requests (user_id);

create index if not exists community_join_requests_reviewed_by_idx
  on public.community_join_requests (reviewed_by);

-- qualifications

drop policy if exists "Owners can manage qualifications" on public.qualifications;
drop policy if exists "Owners can insert qualifications" on public.qualifications;
drop policy if exists "Owners can update qualifications" on public.qualifications;
drop policy if exists "Owners can delete qualifications" on public.qualifications;

create policy "Owners can insert qualifications"
  on public.qualifications
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.professionals p
      where p.id = qualifications.professional_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "Owners can update qualifications"
  on public.qualifications
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.professionals p
      where p.id = qualifications.professional_id
        and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.professionals p
      where p.id = qualifications.professional_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "Owners can delete qualifications"
  on public.qualifications
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.professionals p
      where p.id = qualifications.professional_id
        and p.user_id = (select auth.uid())
    )
  );

-- professional_categories

drop policy if exists "Owners can manage professional categories" on public.professional_categories;
drop policy if exists "Owners can insert professional categories" on public.professional_categories;
drop policy if exists "Owners can update professional categories" on public.professional_categories;
drop policy if exists "Owners can delete professional categories" on public.professional_categories;

create policy "Owners can insert professional categories"
  on public.professional_categories
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_categories.professional_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "Owners can update professional categories"
  on public.professional_categories
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_categories.professional_id
        and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_categories.professional_id
        and p.user_id = (select auth.uid())
    )
  );

create policy "Owners can delete professional categories"
  on public.professional_categories
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_categories.professional_id
        and p.user_id = (select auth.uid())
    )
  );

-- space_categories

drop policy if exists "Owners can manage space categories" on public.space_categories;
drop policy if exists "Owners can insert space categories" on public.space_categories;
drop policy if exists "Owners can update space categories" on public.space_categories;
drop policy if exists "Owners can delete space categories" on public.space_categories;

create policy "Owners can insert space categories"
  on public.space_categories
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.sport_spaces s
      where s.id = space_categories.space_id
        and (
          s.created_by = (select auth.uid())
          or s.owner_user_id = (select auth.uid())
        )
    )
  );

create policy "Owners can update space categories"
  on public.space_categories
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.sport_spaces s
      where s.id = space_categories.space_id
        and (
          s.created_by = (select auth.uid())
          or s.owner_user_id = (select auth.uid())
        )
    )
  )
  with check (
    exists (
      select 1
      from public.sport_spaces s
      where s.id = space_categories.space_id
        and (
          s.created_by = (select auth.uid())
          or s.owner_user_id = (select auth.uid())
        )
    )
  );

create policy "Owners can delete space categories"
  on public.space_categories
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.sport_spaces s
      where s.id = space_categories.space_id
        and (
          s.created_by = (select auth.uid())
          or s.owner_user_id = (select auth.uid())
        )
    )
  );

-- community_join_requests

drop policy if exists "Users can view own community join requests" on public.community_join_requests;
drop policy if exists "Users can create own community join requests" on public.community_join_requests;
drop policy if exists "Community admins can update join requests" on public.community_join_requests;

create policy "Users can view own community join requests"
  on public.community_join_requests
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.community_members cm
      where cm.community_id = community_join_requests.community_id
        and cm.user_id = (select auth.uid())
        and cm.role = 'admin'
    )
  );

create policy "Users can create own community join requests"
  on public.community_join_requests
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Community admins can update join requests"
  on public.community_join_requests
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.community_members cm
      where cm.community_id = community_join_requests.community_id
        and cm.user_id = (select auth.uid())
        and cm.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.community_members cm
      where cm.community_id = community_join_requests.community_id
        and cm.user_id = (select auth.uid())
        and cm.role = 'admin'
    )
  );
