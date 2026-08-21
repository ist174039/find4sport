-- Complete the financial trust boundary started for reservations/transactions.
-- Money, entitlements, credits and Stripe lifecycle state are backend-owned.

-- Package purchases contain paid price, Stripe identifiers and consumable credit.
-- Client access is read-only through existing RLS policies.
revoke insert, update, delete on table public.service_package_purchases from authenticated;
comment on table public.service_package_purchases is
  'Backend-owned package purchase and credit ledger. Authenticated clients are read-only through RLS.';

-- Subscription lifecycle and Stripe identifiers are webhook/server controlled.
revoke insert, update, delete on table public.user_subscriptions from authenticated;
comment on table public.user_subscriptions is
  'Backend-owned subscription lifecycle. Authenticated clients are read-only through RLS.';

-- Plan economics and entitlements determine prices, commission and capabilities.
-- Public/authenticated roles may read public plans through RLS but never mutate them.
revoke insert, update, delete on table public.subscription_plans from anon, authenticated;
revoke insert, update, delete on table public.plan_entitlements from anon, authenticated;
revoke insert, update, delete on table public.user_entitlement_overrides from authenticated;
revoke insert, update, delete on table public.feature_usage from authenticated;
revoke insert, update, delete on table public.plan_change_history from authenticated;

comment on table public.subscription_plans is
  'Server/admin-owned plan economics. Public clients may only read plans allowed by RLS.';
comment on table public.plan_entitlements is
  'Server/admin-owned entitlement definitions. Never client mutable.';
comment on table public.user_entitlement_overrides is
  'Privileged entitlement overrides. Never client mutable.';
comment on table public.feature_usage is
  'Server-maintained usage ledger used for entitlement enforcement. Never client mutable.';
comment on table public.plan_change_history is
  'Immutable-from-client audit history for plan changes.';

-- Paid event enrollment is already server-controlled by RLS hardening. Enforce
-- the same boundary at SQL privilege level so a future permissive policy cannot
-- expose amount/payment/status mutations to authenticated clients.
revoke insert, update, delete on table public.event_participants from authenticated;
comment on table public.event_participants is
  'Server-controlled event enrollment/payment state. Authenticated clients are read-only through RLS.';
