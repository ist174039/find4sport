import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function baseUrl(request: Request) {
  const origin = request.headers.get('origin')
  if (origin) try { return new URL(origin).origin } catch {}
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  if (host) try { return new URL(`${proto}://${host}`).origin } catch {}
  return new URL(request.url).origin
}

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Stripe não está configurado.' }, { status: 503 })
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Autenticação necessária.' }, { status: 401 })

    const { packageId } = await request.json().catch(() => ({}))
    if (!packageId) return NextResponse.json({ error: 'Pacote inválido.' }, { status: 400 })

    const admin = createAdminClient()
    const { data: pack, error } = await (admin as any).from('service_packages').select('id,name,professional_id,service_id,sessions_count,price,validity_days,is_active,service:services(name,is_active),professional:professionals(user_id,status)').eq('id', String(packageId)).maybeSingle()
    if (error || !pack || !pack.is_active || pack.service?.is_active === false || pack.professional?.status !== 'active') return NextResponse.json({ error: 'Este pacote já não está disponível.' }, { status: 404 })
    if (pack.professional?.user_id === user.id) return NextResponse.json({ error: 'Não podes comprar o teu próprio pacote.' }, { status: 400 })

    const amount = Number(pack.price || 0)
    if (!(amount > 0)) return NextResponse.json({ error: 'O preço do pacote é inválido.' }, { status: 400 })

    const expiresAt = pack.validity_days ? new Date(Date.now() + Number(pack.validity_days) * 86400000).toISOString() : null
    const { data: purchase, error: purchaseError } = await (admin as any).from('service_package_purchases').insert({
      user_id: user.id,
      package_id: pack.id,
      professional_id: pack.professional_id,
      service_id: pack.service_id,
      sessions_total: Number(pack.sessions_count),
      sessions_remaining: 0,
      price_paid: amount,
      currency: 'eur',
      status: 'pending',
      expires_at: expiresAt,
    }).select('id').single()
    if (purchaseError || !purchase) return NextResponse.json({ error: 'Não foi possível iniciar a compra do pacote. A migration de pacotes pode ainda não estar aplicada.' }, { status: 500 })

    try {
      const site = baseUrl(request)
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price_data: { currency: 'eur', product_data: { name: pack.name, description: `${pack.sessions_count} sessões · ${pack.service?.name || 'Serviço'}` }, unit_amount: Math.round(amount * 100) }, quantity: 1 }],
        success_url: new URL('/dashboard/compras?package=success&session_id={CHECKOUT_SESSION_ID}', site).toString(),
        cancel_url: new URL(`/profissionais/${pack.professional_id}?package=cancelled`, site).toString(),
        client_reference_id: purchase.id,
        metadata: { service_package_purchase_id: purchase.id, package_id: pack.id, transaction_type: 'service_package' },
      }, { idempotencyKey: `service-package:${purchase.id}` })
      if (!session.url) throw new Error('Stripe não devolveu URL de checkout.')
      const { error: linkError } = await (admin as any).from('service_package_purchases').update({ stripe_session_id: session.id }).eq('id', purchase.id)
      if (linkError) throw linkError
      return NextResponse.json({ url: session.url })
    } catch (checkoutError) {
      await (admin as any).from('service_package_purchases').delete().eq('id', purchase.id).eq('status', 'pending')
      throw checkoutError
    }
  } catch (error) {
    console.error('Package checkout error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível iniciar a compra do pacote.' }, { status: 500 })
  }
}
