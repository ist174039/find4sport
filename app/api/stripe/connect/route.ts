import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia' as any,
}) : null

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!stripe) {
      // Mock onboarding behavior - just redirect back to the billing page
      console.log('No Stripe key found, mocking Stripe Connect onboarding')
      
      // Update professional with a mock account ID if they are a professional
      const { data: prof } = await supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
      if (prof) {
        await supabase.from('professionals').update({ stripe_account_id: 'acct_mocked123' }).eq('id', prof.id)
      }

      const { data: space } = await supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id).maybeSingle()
      if (space) {
        await supabase.from('sport_spaces').update({ stripe_account_id: 'acct_mocked123' }).eq('id', space.id)
      }

      return NextResponse.json({ url: '/dashboard/faturacao?onboarding=mocked' })
    }

    // Actual Logic
    // In a real scenario, you'd check if they already have an account, or create an Express account
    // For this example, we just assume creation
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
    })

    // Store the account ID in the professional / space record
    const { data: prof } = await supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
    if (prof) {
      await supabase.from('professionals').update({ stripe_account_id: account.id }).eq('id', prof.id)
    }

    const { data: space } = await supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id).maybeSingle()
    if (space) {
      await supabase.from('sport_spaces').update({ stripe_account_id: account.id }).eq('id', space.id)
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/faturacao?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/faturacao?onboarded=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })

  } catch (error: any) {
    console.error('Stripe connect error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
