import { subscriptionCheckoutInputSchema } from './subscription-checkout-schema'

const MANAGED_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due', 'unpaid', 'paused'])

type CommercialAudience = 'professional' | 'venue_manager'
function isCommercialAudience(value: string | null): value is CommercialAudience {
  return value === 'professional' || value === 'venue_manager'
}

type UserClient = {
  auth: { getUser: () => Promise<{ data: { user: { id: string; email?: string | null } | null } }> }
}

type AdminClient = {
  from: (table: string) => any
}

export type StripeCheckoutDependency = {
  checkout: { sessions: { create: (params: Record<string, unknown>) => Promise<{ url: string | null }> } }
  billingPortal: { sessions: { create: (params: Record<string, unknown>) => Promise<{ url: string }> } }
}

export type SubscriptionCheckoutDependencies = {
  createUserClient: () => Promise<UserClient>
  createAdminClient: () => AdminClient
  getTrustedApplicationOrigin: (request: Request) => string
  stripe: StripeCheckoutDependency | null
}

export function createSubscriptionCheckoutHandler(deps: SubscriptionCheckoutDependencies) {
  return async function handleSubscriptionCheckout(req: Request): Promise<Response> {
    try {
      const supabase = await deps.createUserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

      const input = subscriptionCheckoutInputSchema.safeParse(await req.json())
      if (!input.success) return Response.json({ error: 'Plano inválido' }, { status: 400 })
      const { planCode, billingCycle } = input.data

      const admin = deps.createAdminClient()
      const { data: profile } = await admin.from('platform_users').select('type').eq('id', user.id).maybeSingle()
      if (!profile || !isCommercialAudience(profile.type)) {
        return Response.json({ error: 'Este tipo de utilizador não possui subscrição comercial' }, { status: 403 })
      }
      const audience = profile.type

      const { data: plan, error: planError } = await admin
        .from('subscription_plans')
        .select('id, code, name, stripe_monthly_price_id, stripe_annual_price_id, is_active, is_public')
        .eq('audience', audience)
        .eq('code', planCode)
        .eq('is_active', true)
        .eq('is_public', true)
        .maybeSingle()
      if (planError || !plan) return Response.json({ error: 'Plano não disponível' }, { status: 404 })

      const priceId = billingCycle === 'annual' ? plan.stripe_annual_price_id : plan.stripe_monthly_price_id
      if (!deps.stripe) return Response.json({ error: 'Stripe ainda não está configurado no servidor' }, { status: 503 })
      if (!priceId) return Response.json({ error: `O preço Stripe do plano ${plan.name} (${billingCycle}) ainda não está configurado` }, { status: 409 })

      const { data: existingSubscription, error: subscriptionError } = await admin
        .from('user_subscriptions')
        .select('stripe_customer_id, stripe_subscription_id, status')
        .eq('user_id', user.id)
        .maybeSingle()
      if (subscriptionError) {
        console.error('Stripe subscription lookup error:', subscriptionError)
        return Response.json(
          { error: 'Não foi possível verificar a subscrição atual. Tente novamente.' },
          { status: 503 },
        )
      }

      const baseUrl = deps.getTrustedApplicationOrigin(req)
      if (
        existingSubscription?.stripe_customer_id &&
        existingSubscription.stripe_subscription_id &&
        MANAGED_SUBSCRIPTION_STATUSES.has(String(existingSubscription.status || ''))
      ) {
        const portal = await deps.stripe.billingPortal.sessions.create({
          customer: existingSubscription.stripe_customer_id,
          return_url: `${baseUrl}/dashboard/faturacao`,
        })
        return Response.json({ url: portal.url, mode: 'portal' })
      }

      const session = await deps.stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/dashboard/faturacao?success=true`,
        cancel_url: `${baseUrl}/dashboard/faturacao?canceled=true`,
        client_reference_id: user.id,
        customer: existingSubscription?.stripe_customer_id || undefined,
        customer_email: existingSubscription?.stripe_customer_id ? undefined : user.email,
        metadata: { user_id: user.id, plan_id: plan.id, plan_code: plan.code, audience, billing_cycle: billingCycle },
        subscription_data: { metadata: { user_id: user.id, plan_id: plan.id, plan_code: plan.code, audience } },
      })

      if (!session.url) return Response.json({ error: 'Stripe não devolveu uma URL de checkout.' }, { status: 502 })
      return Response.json({ url: session.url, mode: 'checkout' })
    } catch (error: unknown) {
      console.error('Stripe checkout error:', error)
      return Response.json({ error: 'Erro ao iniciar checkout' }, { status: 500 })
    }
  }
}
