-- Harden realtime-facing tables so policies are scoped to authenticated users only.

-- messages
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages they received (to mark as read)" ON public.messages;
CREATE POLICY "messages_participant_read" ON public.messages FOR SELECT TO authenticated
USING ((select auth.uid()) = sender_id OR (select auth.uid()) = receiver_id);
CREATE POLICY "messages_sender_insert" ON public.messages FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = sender_id);
CREATE POLICY "messages_receiver_read_receipt" ON public.messages FOR UPDATE TO authenticated
USING ((select auth.uid()) = receiver_id)
WITH CHECK ((select auth.uid()) = receiver_id);

-- notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "notifications_owner_read" ON public.notifications FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);
CREATE POLICY "notifications_owner_update" ON public.notifications FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "notifications_owner_delete" ON public.notifications FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);

-- Reservations are sensitive operational data; make role scope explicit and prevent UPDATE reassignment.
DROP POLICY IF EXISTS "Users can insert their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Professionals can view their reservations" ON public.reservations;
DROP POLICY IF EXISTS "Space owners can view their reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Professionals can update their reservations" ON public.reservations;
DROP POLICY IF EXISTS "Space owners can update their reservations" ON public.reservations;

CREATE POLICY "reservations_customer_insert" ON public.reservations FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "reservations_customer_read" ON public.reservations FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);
CREATE POLICY "reservations_professional_read" ON public.reservations FOR SELECT TO authenticated
USING (professional_id IN (SELECT p.id FROM public.professionals p WHERE p.user_id = (select auth.uid())));
CREATE POLICY "reservations_space_owner_read" ON public.reservations FOR SELECT TO authenticated
USING (space_id IN (SELECT s.id FROM public.sport_spaces s WHERE s.owner_user_id = (select auth.uid())));
CREATE POLICY "reservations_professional_update" ON public.reservations FOR UPDATE TO authenticated
USING (professional_id IN (SELECT p.id FROM public.professionals p WHERE p.user_id = (select auth.uid())))
WITH CHECK (professional_id IN (SELECT p.id FROM public.professionals p WHERE p.user_id = (select auth.uid())));
CREATE POLICY "reservations_space_owner_update" ON public.reservations FOR UPDATE TO authenticated
USING (space_id IN (SELECT s.id FROM public.sport_spaces s WHERE s.owner_user_id = (select auth.uid())))
WITH CHECK (space_id IN (SELECT s.id FROM public.sport_spaces s WHERE s.owner_user_id = (select auth.uid())));

-- Cover the hottest FK access paths used by chat, discovery, reservations and finance.
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS message_threads_provider_user_id_idx ON public.message_threads(provider_user_id);
CREATE INDEX IF NOT EXISTS reservations_professional_id_idx ON public.reservations(professional_id);
CREATE INDEX IF NOT EXISTS reservations_service_id_idx ON public.reservations(service_id);
CREATE INDEX IF NOT EXISTS reservations_space_id_idx ON public.reservations(space_id);
CREATE INDEX IF NOT EXISTS services_professional_id_idx ON public.services(professional_id);
CREATE INDEX IF NOT EXISTS space_rooms_space_id_idx ON public.space_rooms(space_id);
CREATE INDEX IF NOT EXISTS event_participants_user_id_idx ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS community_members_user_id_idx ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS communities_created_by_idx ON public.communities(created_by);
CREATE INDEX IF NOT EXISTS posts_community_id_idx ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON public.post_comments(post_id);

-- Remove known duplicate indexes; retain the canonical constraint/index names.
DROP INDEX IF EXISTS public.post_likes_post_user_unique_idx;
DROP INDEX IF EXISTS public.transactions_related_transaction_idx;
