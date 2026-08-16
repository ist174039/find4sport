import { createClient } from '@/lib/supabase/server'
import { parsePlatformRole } from '@/lib/auth/roles'
import { NextRequest, NextResponse } from 'next/server'

function safeInternalPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
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

      const { data: existingProfile } = await supabase
        .from('platform_users')
        .select('type')
        .eq('id', user.id)
        .maybeSingle()

      const existingRole = parsePlatformRole(existingProfile?.type)

      // New Auth users are provisioned as athlete by the database trigger (least privilege).
      // During an explicit OAuth registration, preserve the selected elevated profile flow
      // instead of treating that provisional athlete row as a completed registration.
      if (existingRole === 'athlete' && explicitRequestedRole === 'professional') {
        return NextResponse.redirect(new URL('/auth/registar/profissional', origin))
      }

      if (existingRole === 'athlete' && explicitRequestedRole === 'venue_manager') {
        return NextResponse.redirect(new URL('/auth/registar/espaco', origin))
      }

      // Existing identities are authoritative. A query string must never downgrade or
      // switch a completed professional/venue-manager account to another role.
      if (existingRole) {
        const resolveUrl = new URL('/auth/resolve', origin)
        resolveUrl.searchParams.set('next', next)
        return NextResponse.redirect(resolveUrl)
      }

      // Defensive fallback for identities created before/without the provisioning trigger.
      if (explicitRequestedRole === 'professional') {
        return NextResponse.redirect(new URL('/auth/registar/profissional', origin))
      }

      if (explicitRequestedRole === 'venue_manager') {
        return NextResponse.redirect(new URL('/auth/registar/espaco', origin))
      }

      if (explicitRequestedRole === 'athlete') {
        const { error: profileError } = await supabase
          .from('platform_users')
          .upsert({
            id: user.id,
            type: 'athlete',
            email: user.email ?? null,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          })

        if (profileError) {
          return NextResponse.redirect(
            `${origin}/auth/error?error=${encodeURIComponent(profileError.message || 'Não foi possível criar o perfil.')}`,
          )
        }

        const resolveUrl = new URL('/auth/resolve', origin)
        resolveUrl.searchParams.set('next', next)
        return NextResponse.redirect(resolveUrl)
      }

      // Ordinary social login without a platform profile must choose an account type.
      return NextResponse.redirect(new URL('/auth/registar', origin))
    }

    if (error) {
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent(error.message || 'Código de confirmação inválido ou já utilizado.')}`,
      )
    }
  }

  const errorDesc = searchParams.get('error_description') || 'Código inválido ou expirado. Pode já ter sido utilizado.'
  return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(errorDesc)}`)
}
