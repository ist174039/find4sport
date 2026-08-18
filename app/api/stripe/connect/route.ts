import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTrustedApplicationOrigin } from '@/lib/http/trusted-origin'
import Stripe from 'stripe'

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error && 'message' in error) return String((error as { message?: unknown }).message || '')
  return ''
}

async function getConnectContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 }) }

  const admin = createAdminClient()
  const { data: profile } = await admin.from('platform_users').select('type').eq('id', user.id).maybeSingle()
  if (!profile || !['professional', 'venue_manager'].includes(profile.type)) {
    return { error: NextResponse.json({ error: 'Stripe Connect está disponível apenas para profissionais e gestores de espaço.' }, { status: 403 }) }
  }

  let accountId: string | null = null
  if (profile.type === 'professional') {
    const { data: professional } = await admin.from('professionals').select('id, stripe_account_id').eq('user_id', user.id).maybeSingle()
    accountId = professional?.stripe_account_id || null
  } else {
    const { data: space } = await admin.from('sport_spaces').select('stripe_account_id').eq('owner_user_id', user.id).not('stripe_account_id', 'is', null).limit(1).maybeSingle()
    accountId = space?.stripe_account_id || null
  }

  return { user, admin, profile, accountId }
}

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) return NextResponse.json({ error: 'Stripe Connect não está configurado no servidor.' }, { status: 503 })

    const context = await getConnectContext()
    if ('error' in context) return context.error
    if (!context.accountId) {
      return NextResponse.json({
        connected: false,
        accountId: null,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        requirementsDue: [],
      })
    }

    const stripe = new Stripe(key)
    const account = await stripe.accounts.retrieve(context.accountId)
    if ('deleted' in account && account.deleted) {
      return NextResponse.json({
        connected: false,
        accountId: context.accountId,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        requirementsDue: [],
      })
    }

    return NextResponse.json({
      connected: true,
      accountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirementsDue: account.requirements?.currently_due || [],
    })
  } catch (error: unknown) {
    console.error('Stripe connect status error:', error)
    return NextResponse.json({ error: errorMessage(error) || 'Não foi possível obter o estado do Stripe Connect.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) return NextResponse.json({ error: 'Stripe Connect não está configurado no servidor.' }, { status: 503 })

    const stripe = new Stripe(key)
    const context = await getConnectContext()
    if ('error' in context) return context.error

    const { user, admin, profile } = context
    let accountId = context.accountId

    if (!accountId) {
      try {
        const account = await stripe.accounts.create({
          type: 'express',
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: 'individual',
          metadata: { find4sport_user_id: user.id, audience: profile.type },
        })
        accountId = account.id
      } catch (error: unknown) {
        const message = errorMessage(error)
        if (message.includes('connected_account_write') || message.includes('Accounts Write') || message.includes('required permissions')) {
          return NextResponse.json({
            error: 'A chave Stripe configurada não tem permissão para criar/alterar contas Connect. Ative a permissão Accounts Write (connected_account_write) na restricted key usada por STRIPE_SECRET_KEY.',
            code: 'stripe_connect_key_permission',
          }, { status: 503 })
        }
        throw error
      }

      if (profile.type === 'professional') {
        const { error } = await admin.from('professionals').update({ stripe_account_id: accountId }).eq('user_id', user.id)
        if (error) throw new Error('Não foi possível associar a conta Stripe ao perfil profissional.')
      } else {
        const { error } = await admin.from('sport_spaces').update({ stripe_account_id: accountId }).eq('owner_user_id', user.id)
        if (error) throw new Error('Não foi possível associar a conta Stripe ao espaço.')
      }
    }

    const baseUrl = getTrustedApplicationOrigin(req)
    const refreshUrl = new URL('/dashboard/faturacao?connect=refresh', baseUrl).toString()
    const returnUrl = new URL('/dashboard/faturacao?connect=complete', baseUrl).toString()

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: unknown) {
    console.error('Stripe connect error:', error)
    return NextResponse.json({ error: errorMessage(error) || 'Não foi possível iniciar o onboarding Stripe Connect.' }, { status: 500 })
  }
}
