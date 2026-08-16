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

  // Admin is a separate security domain and must never enter the platform dashboard.
  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (admin) {
    return NextResponse.redirect(new URL('/admin', origin))
  }

  const { data: profile } = await supabase
    .from('platform_users')
    .select('id, type')
    .eq('id', user.id)
    .maybeSingle()

  // Authentication and registration are separate concerns. A successful login
  // must not silently create or downgrade a platform profile.
  if (!profile || !profile.type) {
    return NextResponse.redirect(new URL('/auth/registar', origin))
  }

  const next = safeInternalPath(request.nextUrl.searchParams.get('next'), '/dashboard')
  return NextResponse.redirect(new URL(next, origin))
}
