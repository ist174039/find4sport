-- Production hardening: social writes must pass validated server actions.

-- Posts and comments are created only by validated server actions using the
-- service-role client. Removing direct client INSERT prevents bypassing role,
-- entitlement, verification and community-policy checks.
drop policy if exists "Users can insert posts" on public.posts;
drop policy if exists "Users can insert comments" on public.post_comments;

drop policy if exists "Users can delete own comments" on public.post_comments;
create policy "Users can delete own comments" on public.post_comments for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can like posts" on public.post_likes;
create policy "Users can like posts" on public.post_likes for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can unlike posts" on public.post_likes;
create policy "Users can unlike posts" on public.post_likes for delete to authenticated using ((select auth.uid()) = user_id);
