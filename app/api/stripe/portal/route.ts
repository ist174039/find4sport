import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTrustedApplicationOrigin } from '@/lib/http/trusted-origin'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe não está configurado no servidor.' }, { status: 503 })
    }

    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'Não existe cliente Stripe associado a esta conta.' }, { status: 404 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${getTrustedApplicationOrigin(req)}/dashboard/faturacao`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Stripe portal error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro ao abrir faturação Stripe.' }, { status: 500 })
  }
}
