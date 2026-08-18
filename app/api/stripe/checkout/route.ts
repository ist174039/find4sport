import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTrustedApplicationOrigin } from '@/lib/http/trusted-origin'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
const MANAGED_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due', 'unpaid', 'paused'])

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const planCode = String(body.planCode || '')
    const billingCycle = body.billingCycle === 'annual' ? 'annual' : 'monthly'
    if (!['pro', 'premium'].includes(planCode)) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('platform_users').select('type').eq('id', user.id).maybeSingle()
    if (!profile || !['professional', 'venue_manager'].includes(profile.type)) {
      return NextResponse.json({ error: 'Este tipo de utilizador não possui subscrição comercial' }, { status: 403 })
    }

    const { data: plan, error: planError } = await admin
      .from('subscription_plans')
      .select('id, code, name, stripe_monthly_price_id, stripe_annual_price_id, is_active, is_public')
      .eq('audience', profile.type)
      .eq('code', planCode)
      .eq('is_active', true)
      .eq('is_public', true)
      .maybeSingle()
    if (planError || !plan) return NextResponse.json({ error: 'Plano não disponível' }, { status: 404 })

    const priceId = billingCycle === 'annual' ? plan.stripe_annual_price_id : plan.stripe_monthly_price_id
    if (!stripe) return NextResponse.json({ error: 'Stripe ainda não está configurado no servidor' }, { status: 503 })
    if (!priceId) return NextResponse.json({ error: `O preço Stripe do plano ${plan.name} (${billingCycle}) ainda não está configurado` }, { status: 409 })

    const { data: existingSubscription } = await admin
      .from('user_subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, status')
      .eq('user_id', user.id)
      .maybeSingle()

    const baseUrl = getTrustedApplicationOrigin(req)
    if (
      existingSubscription?.stripe_customer_id &&
      existingSubscription.stripe_subscription_id &&
      MANAGED_SUBSCRIPTION_STATUSES.has(String(existingSubscription.status || ''))
    ) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: existingSubscription.stripe_customer_id,
        return_url: `${baseUrl}/dashboard/faturacao`,
      })
      return NextResponse.json({ url: portal.url, mode: 'portal' })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/faturacao?success=true`,
      cancel_url: `${baseUrl}/dashboard/faturacao?canceled=true`,
      client_reference_id: user.id,
      customer: existingSubscription?.stripe_customer_id || undefined,
      customer_email: existingSubscription?.stripe_customer_id ? undefined : user.email,
      metadata: { user_id: user.id, plan_id: plan.id, plan_code: plan.code, audience: profile.type, billing_cycle: billingCycle },
      subscription_data: { metadata: { user_id: user.id, plan_id: plan.id, plan_code: plan.code, audience: profile.type } },
    })

    if (!session.url) return NextResponse.json({ error: 'Stripe não devolveu uma URL de checkout.' }, { status: 502 })
    return NextResponse.json({ url: session.url, mode: 'checkout' })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro ao iniciar checkout' }, { status: 500 })
  }
}
