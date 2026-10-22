import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PUBLIC_SPACE_STATUS } from '@/lib/domain/public-entities'
import { isPublicAccountEligible } from '@/lib/auth/public-account-eligibility'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,119}$/.test(slug)) {
    return NextResponse.json({ error: 'Identificador inválido.' }, { status: 400, headers: { 'Cache-Control': 'private, no-store' } })
  }
  const admin = createAdminClient()
  const isUuid = /^[0-9a-f-]{36}$/i.test(slug)
  const lookup = (column: 'id' | 'slug') => admin.from('sport_spaces').select('id,slug,status,owner_user_id').eq(column, slug).maybeSingle()

  const firstResult = isUuid ? await lookup('id') : await lookup('slug')
  if (firstResult.error) {
    console.error('Public booking space lookup failed:', firstResult.error)
    return NextResponse.json({ error: 'Não foi possível verificar o espaço.' }, { status: 500, headers: { 'Cache-Control': 'private, no-store' } })
  }
  let space = firstResult.data
  if (!space && !isUuid) {
    const fallbackResult = await lookup('id')
    if (fallbackResult.error) {
      console.error('Public booking space fallback lookup failed:', fallbackResult.error)
      return NextResponse.json({ error: 'Não foi possível verificar o espaço.' }, { status: 500, headers: { 'Cache-Control': 'private, no-store' } })
    }
    space = fallbackResult.data
  }
  if (!space || space.status !== PUBLIC_SPACE_STATUS) {
    return NextResponse.json({ space: null }, { headers: { 'Cache-Control': 'private, no-store' } })
  }
  if (!space.owner_user_id) return NextResponse.json({ space: null }, { headers: { 'Cache-Control': 'private, no-store' } })

  const { data: owner, error: ownerError } = await admin.from('platform_users').select('account_status,suspended_until').eq('id', space.owner_user_id).maybeSingle()
  if (ownerError) {
    console.error('Public booking owner status lookup failed:', ownerError)
    return NextResponse.json({ error: 'Não foi possível verificar o espaço.' }, { status: 500, headers: { 'Cache-Control': 'private, no-store' } })
  }
  if (!isPublicAccountEligible(owner?.account_status, owner?.suspended_until)) return NextResponse.json({ space: null }, { headers: { 'Cache-Control': 'private, no-store' } })

  return NextResponse.json({ space: { id: space.id, slug: space.slug, status: space.status } }, { headers: { 'Cache-Control': 'private, no-store' } })
}
