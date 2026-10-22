import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isPublicAccountEligible } from '@/lib/auth/public-account-eligibility'

type PackageRow = { id: string; name: string; service_id: string | null; sessions_count: number; price: number | string; validity_days: number | null; service: { name: string | null; is_active: boolean | null } | null }
type PackageQuery = { select: (columns: string) => PackageQuery; eq: (column: string, value: unknown) => PackageQuery; order: (column: string) => Promise<{ data: PackageRow[] | null; error: { code?: string; message?: string } | null }> }

function missingTable(error: { code?: string; message?: string } | null) { return ['42P01','PGRST205'].includes(String(error?.code||'')) || String(error?.message||'').includes('service_packages') }

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const db = admin as unknown as { from: (table: 'service_packages') => PackageQuery }

  const { data: professional } = await admin.from('professionals').select('id,user_id,status,is_premium,stripe_account_id').eq('id', id).maybeSingle()
  const paymentsEnabled = professional?.status === 'active' && /^acct_[A-Za-z0-9]{16,}$/.test(String(professional.stripe_account_id || ''))
  if (!professional || professional.status !== 'active') return NextResponse.json({ packages: [], paymentsEnabled: false }, { headers: { 'Cache-Control': 'private, no-store' } })
  const { data: owner } = await admin.from('platform_users').select('account_status,suspended_until').eq('id', professional.user_id).maybeSingle()
  if (!isPublicAccountEligible(owner?.account_status, owner?.suspended_until)) return NextResponse.json({ packages: [], paymentsEnabled: false }, { headers: { 'Cache-Control': 'private, no-store' } })
  const { data: subscription } = await admin.from('user_subscriptions').select('tier,status').eq('user_id', professional.user_id).maybeSingle()
  const premium = Boolean(professional.is_premium) || (subscription?.tier === 'premium' && ['active','trialing'].includes(String(subscription?.status)))
  if (!premium) return NextResponse.json({ packages: [], paymentsEnabled }, { headers: { 'Cache-Control': 'private, no-store' } })

  const { data, error } = await db.from('service_packages').select('id,name,service_id,sessions_count,price,validity_days,service:services(name,is_active)').eq('professional_id', id).eq('is_active', true).order('price')
  if (error) {
    if (missingTable(error)) return NextResponse.json({ packages: [], paymentsEnabled }, { headers: { 'Cache-Control': 'private, no-store' } })
    return NextResponse.json({ error: 'Não foi possível carregar os pacotes.' }, { status: 500 })
  }
  return NextResponse.json({ packages: (data || []).filter(row => row.service?.is_active !== false).map(row => ({ id: row.id, name: row.name, service_id: row.service_id, sessions_count: row.sessions_count, price: Number(row.price), validity_days: row.validity_days, service_name: row.service?.name || null })), paymentsEnabled }, { headers: { 'Cache-Control': 'private, no-store' } })
}
