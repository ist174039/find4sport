BEGIN;

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL REFERENCES public.platform_users(id) ON DELETE SET NULL,
  created_by_admin_id uuid NULL REFERENCES public.admins(id) ON DELETE SET NULL,
  assigned_admin_id uuid NULL REFERENCES public.admins(id) ON DELETE SET NULL,
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'open',
  related_type text NULL,
  related_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz NULL,
  CONSTRAINT support_tickets_subject_length CHECK (char_length(subject) BETWEEN 4 AND 160),
  CONSTRAINT support_tickets_category_check CHECK (category = ANY (ARRAY['general','account','billing','booking','professional','space','event','technical'])),
  CONSTRAINT support_tickets_priority_check CHECK (priority = ANY (ARRAY['low','normal','high','urgent'])),
  CONSTRAINT support_tickets_status_check CHECK (status = ANY (ARRAY['open','pending_admin','pending_user','resolved','closed']))
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_user_id uuid NULL REFERENCES public.platform_users(id) ON DELETE SET NULL,
  sender_admin_id uuid NULL REFERENCES public.admins(id) ON DELETE SET NULL,
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT support_messages_body_length CHECK (char_length(body) BETWEEN 1 AND 5000),
  CONSTRAINT support_messages_exactly_one_sender CHECK ((sender_user_id IS NOT NULL) <> (sender_admin_id IS NOT NULL)),
  CONSTRAINT support_messages_internal_admin_only CHECK (NOT is_internal OR sender_admin_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS support_tickets_user_updated_idx ON public.support_tickets(user_id, updated_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS support_tickets_status_priority_updated_idx ON public.support_tickets(status, priority, updated_at DESC);
CREATE INDEX IF NOT EXISTS support_tickets_assigned_updated_idx ON public.support_tickets(assigned_admin_id, updated_at DESC) WHERE assigned_admin_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS support_messages_ticket_created_idx ON public.support_messages(ticket_id, created_at ASC);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.support_tickets FROM anon;
REVOKE ALL ON public.support_messages FROM anon;
REVOKE ALL ON public.support_tickets FROM authenticated;
REVOKE ALL ON public.support_messages FROM authenticated;
GRANT SELECT ON public.support_tickets TO authenticated;
GRANT SELECT ON public.support_messages TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
GRANT ALL ON public.support_messages TO service_role;

DROP POLICY IF EXISTS support_tickets_user_read ON public.support_tickets;
CREATE POLICY support_tickets_user_read
ON public.support_tickets
FOR SELECT
TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS support_messages_user_read ON public.support_messages;
CREATE POLICY support_messages_user_read
ON public.support_messages
FOR SELECT
TO authenticated
USING (
  is_internal = false
  AND EXISTS (
    SELECT 1
    FROM public.support_tickets t
    WHERE t.id = support_messages.ticket_id
      AND t.user_id = (select auth.uid())
  )
);

COMMIT;
