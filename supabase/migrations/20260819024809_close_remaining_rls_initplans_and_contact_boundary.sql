-- Mirrors production migration 20260819024809 / close_remaining_rls_initplans_and_contact_boundary.
-- Close the direct contact-message boundary, remove remaining auth init-plan hot spots,
-- consolidate equivalent SELECT policies, and cover remaining foreign keys.

-- contact_messages is server-action only; service-role inserts bypass RLS.
drop policy if exists "Allow anonymous users to insert contact messages" on public.contact_messages;
drop policy if exists "Allow authenticated users to read contact messages" on public.contact_messages;

-- professionals: service_role bypasses RLS; authenticated users may create only their own profile.
drop policy if exists "Users can create professional profiles" on public.professionals;
drop policy if exists "Users can update their professional profile" on public.professionals;

create policy "Users can create professional profiles"
  on public.professionals
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- reviews: preserve approved public visibility, self visibility and target-owner visibility.
drop policy if exists "Reviews readable by everyone if approved" on public.reviews;
drop policy if exists "Targets can view their reviews" on public.reviews;
drop policy if exists "Users can create reviews" on public.reviews;
drop policy if exists "Users can update their own reviews" on public.reviews;
drop policy if exists "reviews_read" on public.reviews;

create policy "reviews_read"
  on public.reviews
  for select
  to public
  using (
    status = 'approved'::review_status
    or user_id = (select auth.uid())
    or exists (
      select 1
      from public.professionals p
      where p.id = reviews.professional_id
        and p.user_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.sport_spaces s
      where s.id = reviews.space_id
        and s.owner_user_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.events e
      where e.id = reviews.event_id
        and e.created_by = (select auth.uid())
    )
  );

create policy "Users can create reviews"
  on public.reviews
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own reviews"
  on public.reviews
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- cms_pages: one read policy, separate admin mutations.
drop policy if exists "Admins can manage all pages" on public.cms_pages;
drop policy if exists "Public can read published pages" on public.cms_pages;
drop policy if exists "cms_pages_read" on public.cms_pages;
drop policy if exists "Admins can insert pages" on public.cms_pages;
drop policy if exists "Admins can update pages" on public.cms_pages;
drop policy if exists "Admins can delete pages" on public.cms_pages;

create policy "cms_pages_read"
  on public.cms_pages
  for select
  to public
  using (
    is_published = true
    or exists (
      select 1
      from public.admins a
      where a.auth_user_id = (select auth.uid())
    )
  );

create policy "Admins can insert pages"
  on public.cms_pages
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admins a
      where a.auth_user_id = (select auth.uid())
    )
  );

create policy "Admins can update pages"
  on public.cms_pages
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admins a
      where a.auth_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.admins a
      where a.auth_user_id = (select auth.uid())
    )
  );

create policy "Admins can delete pages"
  on public.cms_pages
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admins a
      where a.auth_user_id = (select auth.uid())
    )
  );

-- community_media: preserve public/private visibility and admin-only mutations.
drop policy if exists "community_media_select" on public.community_media;
drop policy if exists "community_media_admin_insert" on public.community_media;
drop policy if exists "community_media_admin_delete" on public.community_media;

create policy "community_media_select"
  on public.community_media
  for select
  to public
  using (
    exists (
      select 1
      from public.communities c
      where c.id = community_media.community_id
        and (
          c.is_private = false
          or exists (
            select 1
            from public.community_members cm
            where cm.community_id = c.id
              and cm.user_id = (select auth.uid())
          )
        )
    )
  );

create policy "community_media_admin_insert"
  on public.community_media
  for insert
  to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and exists (
      select 1
      from public.community_members cm
      where cm.community_id = community_media.community_id
        and cm.user_id = (select auth.uid())
        and cm.role = 'admin'
    )
  );

create policy "community_media_admin_delete"
  on public.community_media
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.community_members cm
      where cm.community_id = community_media.community_id
        and cm.user_id = (select auth.uid())
        and cm.role = 'admin'
    )
  );

-- content_reports: same authorization, optimized auth lookup.
drop policy if exists "Users can create own content reports" on public.content_reports;
drop policy if exists "Users can view own content reports" on public.content_reports;
drop policy if exists "Admins can manage content reports" on public.content_reports;

create policy "Users can create own content reports"
  on public.content_reports
  for insert
  to authenticated
  with check (reporter_user_id = (select auth.uid()));

create policy "Users can view own content reports"
  on public.content_reports
  for select
  to authenticated
  using (
    reporter_user_id = (select auth.uid())
    or exists (
      select 1
      from public.admins a
      where a.auth_user_id = (select auth.uid())
    )
  );

create policy "Admins can manage content reports"
  on public.content_reports
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admins a
      where a.auth_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.admins a
      where a.auth_user_id = (select auth.uid())
    )
  );

-- remaining FK coverage.
create index if not exists community_media_uploaded_by_idx
  on public.community_media (uploaded_by);
create index if not exists content_reports_reviewed_by_idx
  on public.content_reports (reviewed_by);
create index if not exists plan_change_history_changed_by_idx
  on public.plan_change_history (changed_by);
create index if not exists reservation_delivery_events_actor_user_id_idx
  on public.reservation_delivery_events (actor_user_id);
create index if not exists service_moderation_history_actor_user_id_idx
  on public.service_moderation_history (actor_user_id);
create index if not exists services_reviewed_by_idx
  on public.services (reviewed_by);
create index if not exists space_claims_space_id_idx
  on public.space_claims (space_id);
create index if not exists sport_spaces_created_by_idx
  on public.sport_spaces (created_by);
create index if not exists user_entitlement_overrides_created_by_idx
  on public.user_entitlement_overrides (created_by);
