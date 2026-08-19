-- Mirrors production migration 20260819024526 / index_social_and_marketplace_foreign_keys.
-- Cover foreign-key lookups used by social, reviews, packages, and space-professional paths.

create index if not exists post_comments_user_id_idx
  on public.post_comments (user_id);

create index if not exists post_likes_user_id_idx
  on public.post_likes (user_id);

create index if not exists posts_professional_id_idx
  on public.posts (professional_id);

create index if not exists posts_sport_space_id_idx
  on public.posts (sport_space_id);

create index if not exists posts_user_id_idx
  on public.posts (user_id);

create index if not exists reviews_event_id_idx
  on public.reviews (event_id);

create index if not exists reviews_user_id_idx
  on public.reviews (user_id);

create index if not exists service_package_purchases_package_id_idx
  on public.service_package_purchases (package_id);

create index if not exists space_professionals_professional_id_idx
  on public.space_professionals (professional_id);
