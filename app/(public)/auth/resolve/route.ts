import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function safeInternalPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const origin = request.nextUrl.origin

  if (!user) {
    const loginUrl = new URL('/auth/login', origin)
    loginUrl.searchParams.set('redirect', safeInternalPath(request.nextUrl.searchParams.get('next'), '/dashboard'))
    return NextResponse.redirect(loginUrl)
  }

  const accountStatus = String(user.user_metadata?.account_status || '')
  if (accountStatus === 'deactivated' || accountStatus === 'deletion_requested') {
    return NextResponse.redirect(new URL('/auth/reactivar', origin))
  }

  const { data: admin } = await supabase.from('admins').select('id').eq('auth_user_id', user.id).maybeSingle()
  if (admin) return NextResponse.redirect(new URL('/admin', origin))

  const { data: profile } = await supabase.from('platform_users').select('id, type, account_status, suspended_until').eq('id', user.id).maybeSingle()
  if (!profile || !profile.type) return NextResponse.redirect(new URL('/auth/registar', origin))
  const restrictionActive = profile.account_status === 'blocked' || (profile.account_status === 'suspended' && (!profile.suspended_until || new Date(profile.suspended_until).getTime() > Date.now()))
  if (restrictionActive) return NextResponse.redirect(new URL('/conta/restrita', origin))

  const next = safeInternalPath(request.nextUrl.searchParams.get('next'), '/dashboard')
  return NextResponse.redirect(new URL(next, origin))
}
