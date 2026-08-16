BEGIN;

ALTER TABLE public.communities
  ADD COLUMN IF NOT EXISTS posting_policy text NOT NULL DEFAULT 'members'
  CHECK (posting_policy IN ('members','reactions_only','admin_only'));

COMMENT ON COLUMN public.communities.posting_policy IS
'Controls community publishing: members=all members may post; reactions_only=only admins post, members may react; admin_only=only admins publish and manage discussion.';

COMMIT;
