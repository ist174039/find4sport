-- Community posts inherit the visibility of their parent community.
-- Standalone feed posts remain public.
drop policy if exists "Public profiles are viewable by everyone." on public.posts;
drop policy if exists "posts_visible_by_community" on public.posts;
create policy "posts_visible_by_community"
on public.posts
for select
to anon, authenticated
using (
  community_id is null
  or app_private.can_view_community(community_id)
);

drop policy if exists "Comments are viewable by everyone" on public.post_comments;
drop policy if exists "post_comments_visible_by_post" on public.post_comments;
create policy "post_comments_visible_by_post"
on public.post_comments
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_comments.post_id
      and (
        p.community_id is null
        or app_private.can_view_community(p.community_id)
      )
  )
);

drop policy if exists "Likes are viewable by everyone" on public.post_likes;
drop policy if exists "post_likes_visible_by_post" on public.post_likes;
create policy "post_likes_visible_by_post"
on public.post_likes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_likes.post_id
      and (
        p.community_id is null
        or app_private.can_view_community(p.community_id)
      )
  )
);
