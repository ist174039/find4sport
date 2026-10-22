import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data } = await admin.from('sport_spaces').select('owner_user_id,status,stripe_account_id').eq('id', id).maybeSingle()
  const { data: owner } = data?.owner_user_id
    ? await admin.from('platform_users').select('account_status,suspended_until').eq('id', data.owner_user_id).maybeSingle()
    : { data: null }
  const accountVisible = owner?.account_status === 'active' || (owner?.account_status === 'suspended' && Boolean(owner.suspended_until) && Date.parse(String(owner.suspended_until)) <= Date.now())
  const active = data?.status === 'active' && accountVisible
  const enabled = active && /^acct_[A-Za-z0-9]{16,}$/.test(String(data.stripe_account_id || ''))
  return NextResponse.json({ active, enabled }, { headers: { 'Cache-Control': 'private, no-store' } })
}
