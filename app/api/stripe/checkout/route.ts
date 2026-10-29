import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTrustedApplicationOrigin } from '@/lib/http/trusted-origin'
import { createSubscriptionCheckoutHandler, type StripeCheckoutDependency } from '@/lib/billing/subscription-checkout-handler'
import Stripe from 'stripe'

const defaultStripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

export const POST = createSubscriptionCheckoutHandler({
  createUserClient: createClient,
  createAdminClient,
  getTrustedApplicationOrigin,
  stripe: defaultStripe as unknown as StripeCheckoutDependency | null,
})
