import { createClient } from '@/lib/supabase/server'
import { parsePlatformRole } from '@/lib/auth/roles'
import { NextRequest, NextResponse } from 'next/server'

function safeInternalPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

function setupUrl(origin: string, path: string, next: string) {
  const url = new URL(path, origin)
  url.searchParams.set('next', next)
  return url
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = safeInternalPath(searchParams.get('next'), '/dashboard')

  if (code) {
    const supabase = await createClient()
    const { error, data: sessionData } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && sessionData?.user) {
      const user = sessionData.user
      const explicitRequestedRole = parsePlatformRole(searchParams.get('type'))
      const { data: existingProfile } = await supabase.from('platform_users').select('type').eq('id', user.id).maybeSingle()
      const existingRole = parsePlatformRole(existingProfile?.type)

      // The provisioning trigger creates the least-privileged athlete row. An explicit
      // professional/space registration may continue to its dedicated setup, but query
      // parameters never overwrite an already-completed elevated account.
      if (existingRole === 'athlete' && explicitRequestedRole === 'professional') {
        return NextResponse.redirect(setupUrl(origin, '/auth/registar/profissional', next))
      }
      if (existingRole === 'athlete' && explicitRequestedRole === 'venue_manager') {
        return NextResponse.redirect(setupUrl(origin, '/auth/registar/espaco', next))
      }
      if (existingRole === 'athlete' && explicitRequestedRole === 'event_manager') {
        const { error: roleError } = await supabase.from('platform_users').update({ type: 'event_manager' }).eq('id', user.id)
        if (roleError) return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(roleError.message)}`)
        return NextResponse.redirect(new URL(next, origin))
      }

      if (existingRole) {
        const resolveUrl = new URL('/auth/resolve', origin)
        resolveUrl.searchParams.set('next', next)
        return NextResponse.redirect(resolveUrl)
      }

      if (explicitRequestedRole === 'professional') return NextResponse.redirect(setupUrl(origin, '/auth/registar/profissional', next))
      if (explicitRequestedRole === 'venue_manager') return NextResponse.redirect(setupUrl(origin, '/auth/registar/espaco', next))
      if (explicitRequestedRole === 'event_manager') {
        const { error: profileError } = await supabase.from('platform_users').upsert({ id: user.id, type: 'event_manager', full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Gestor de eventos' })
        if (profileError) return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(profileError.message)}`)
        return NextResponse.redirect(new URL(next, origin))
      }

      if (explicitRequestedRole === 'athlete') {
        const { error: profileError } = await supabase.from('platform_users').upsert({
          id: user.id,
          type: 'athlete',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilizador',
        })

        if (profileError) {
          return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(profileError.message || 'Não foi possível criar o perfil.')}`)
        }

        const resolveUrl = new URL('/auth/resolve', origin)
        resolveUrl.searchParams.set('next', next)
        return NextResponse.redirect(resolveUrl)
      }

      const registrationUrl = new URL('/auth/registar', origin)
      registrationUrl.searchParams.set('next', next)
      return NextResponse.redirect(registrationUrl)
    }

    if (error) return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error.message || 'Código de confirmação inválido ou já utilizado.')}`)
  }

  const errorDesc = searchParams.get('error_description') || 'Código inválido ou expirado. Pode já ter sido utilizado.'
  return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(errorDesc)}`)
}
