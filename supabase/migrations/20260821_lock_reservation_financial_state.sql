-- Financial state is a server-side trust boundary.
-- Authenticated Supabase clients must never be able to mutate reservation
-- payment/settlement amounts or Stripe identifiers directly.

-- RLS determines which rows a provider may operate on. Column privileges below
-- additionally constrain what an authenticated client may change on those rows.
revoke update on table public.reservations from authenticated;

-- Providers may only perform the non-financial operational transitions that are
-- still intentionally supported through the authenticated Supabase role.
-- Financial and Stripe-owned columns are deliberately excluded.
grant update (
  status,
  service_delivery_status,
  updated_at
) on table public.reservations to authenticated;

-- Explicit documentation-by-enforcement: these columns remain service-role only
-- for mutation. REVOKE is repeated at column level to protect against a future
-- broad table-level UPDATE grant being added accidentally.
revoke update (
  user_id,
  professional_id,
  service_id,
  space_id,
  amount,
  stripe_session_id,
  payment_status,
  settlement_status
) on table public.reservations from authenticated;

-- Financial ledger is backend-owned. RLS SELECT policies still allow each user
-- to read their own ledger rows; no authenticated client may create or mutate it.
revoke insert, update, delete on table public.transactions from authenticated;

comment on table public.transactions is
  'Backend-owned financial ledger. Authenticated clients may read only through RLS; mutations require trusted server/service-role code.';
comment on column public.reservations.payment_status is
  'Backend-owned financial state. Never mutable directly by authenticated Supabase clients.';
comment on column public.reservations.amount is
  'Server-authoritative reservation amount. Never mutable directly by authenticated Supabase clients.';
comment on column public.reservations.settlement_status is
  'Backend-owned settlement state. Never mutable directly by authenticated Supabase clients.';
