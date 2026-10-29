begin;
-- Keep public review listing independent of private ownership helper functions.
drop policy if exists "reviews_read" on public.reviews;
drop policy if exists "reviews_approved_public_read" on public.reviews;
drop policy if exists "reviews_participant_authenticated_read" on public.reviews;

create policy "reviews_approved_public_read"
on public.reviews for select to anon, authenticated
using (status = 'approved'::review_status);

create policy "reviews_participant_authenticated_read"
on public.reviews for select to authenticated
using (
  user_id = (select auth.uid())
  or app_private.owns_professional(professional_id)
  or app_private.owns_space(space_id)
  or exists (
    select 1 from public.events e
    where e.id = reviews.event_id
      and e.created_by = (select auth.uid())
  )
);
commit;