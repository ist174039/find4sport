import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Initialize Stripe only if the key exists to avoid crashing
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia' as any, // latest typings might differ
}) : null

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier, priceId } = await req.json()

    // Without a real stripe key, simulate a success url
    if (!stripe) {
      console.log('No Stripe key found, mocking checkout session for tier:', tier)
      
      // Update DB directly to simulate payment success
      await supabase.from('user_subscriptions').upsert({
        user_id: user.id,
        tier: tier,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

      return NextResponse.json({ url: '/dashboard/faturacao?success=true' })
    }

    // Actual Stripe Logic
    // In a real scenario, you'd fetch the user's stripe_customer_id from the DB
    // and pass it to Stripe.
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/faturacao?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/faturacao?canceled=true`,
      client_reference_id: user.id,
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
