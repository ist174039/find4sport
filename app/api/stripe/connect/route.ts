import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

function asHttpOrigin(value?: string | null) {
  const candidate = value?.trim()
  if (!candidate) return null
  try {
    const url = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return url.origin
  } catch {
    return null
  }
}

function getBaseUrl(req: Request) {
  const originHeader = asHttpOrigin(req.headers.get('origin'))
  if (originHeader) return originHeader

  const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host')
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  if (forwardedHost) {
    const forwardedOrigin = asHttpOrigin(`${forwardedProto === 'http' ? 'http' : 'https'}://${forwardedHost.split(',')[0].trim()}`)
    if (forwardedOrigin) return forwardedOrigin
  }

  const configured = asHttpOrigin(process.env.NEXT_PUBLIC_SITE_URL)
  if (configured) return configured

  const requestOrigin = asHttpOrigin(req.url)
  if (requestOrigin) return requestOrigin

  throw new Error('Não foi possível determinar uma URL pública HTTP/HTTPS para o Stripe Connect.')
}

export async function POST(req: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) return NextResponse.json({ error: 'Stripe Connect não está configurado no servidor.' }, { status: 503 })

    const stripe = new Stripe(key)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('platform_users').select('type').eq('id', user.id).maybeSingle()
    if (!profile || !['professional', 'venue_manager'].includes(profile.type)) {
      return NextResponse.json({ error: 'Stripe Connect está disponível apenas para profissionais e gestores de espaço.' }, { status: 403 })
    }

    let accountId: string | null = null
    if (profile.type === 'professional') {
      const { data: professional } = await admin.from('professionals').select('id, stripe_account_id').eq('user_id', user.id).maybeSingle()
      accountId = professional?.stripe_account_id || null
    } else {
      const { data: space } = await admin.from('sport_spaces').select('stripe_account_id').eq('owner_user_id', user.id).not('stripe_account_id', 'is', null).limit(1).maybeSingle()
      accountId = space?.stripe_account_id || null
    }

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
      } catch (error: any) {
        const message = String(error?.message || '')
        if (message.includes('connected_account_write') || message.includes('Accounts Write') || message.includes('required permissions')) {
          return NextResponse.json({
            error: 'A chave Stripe configurada não tem permissão para criar/alterar contas Connect. Ative a permissão Accounts Write (connected_account_write) na restricted key usada por STRIPE_SECRET_KEY.',
            code: 'stripe_connect_key_permission',
          }, { status: 503 })
        }
        throw error
      }

      if (profile.type === 'professional') {
        await admin.from('professionals').update({ stripe_account_id: accountId }).eq('user_id', user.id)
      } else {
        await admin.from('sport_spaces').update({ stripe_account_id: accountId }).eq('owner_user_id', user.id)
      }
    }

    const baseUrl = getBaseUrl(req)
    const refreshUrl = new URL('/dashboard/faturacao?connect=refresh', baseUrl).toString()
    const returnUrl = new URL('/dashboard/faturacao?connect=complete', baseUrl).toString()

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error: any) {
    console.error('Stripe connect error:', error)
    return NextResponse.json({ error: error?.message || 'Não foi possível iniciar o onboarding Stripe Connect.' }, { status: 500 })
  }
}
