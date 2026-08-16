import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function safeInternalPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

function normalizeRequestedType(value: unknown): 'athlete' | 'professional' | 'venue_manager' | null {
  if (value === 'athlete' || value === 'user' || value === 'utilizador' || value === 'atleta') return 'athlete'
  if (value === 'professional' || value === 'profissional') return 'professional'
  if (value === 'venue_manager' || value === 'sport_space' || value === 'espaco' || value === 'gestor_espaco') return 'venue_manager'
  return null
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
      const requestedType = normalizeRequestedType(
        searchParams.get('type') ?? user.user_metadata?.type,
      )

      const { data: existingProfile } = await supabase
        .from('platform_users')
        .select('type')
        .eq('id', user.id)
        .maybeSingle()

      // Existing platform identities are resolved centrally. Never overwrite
      // their role based on an OAuth query string or stale user metadata.
      if (existingProfile?.type) {
        const resolveUrl = new URL('/auth/resolve', origin)
        resolveUrl.searchParams.set('next', next)
        return NextResponse.redirect(resolveUrl)
      }

      // Athlete is the only account type that can be completed immediately:
      // its platform profile is the complete domain record.
      if (requestedType === 'athlete') {
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

      // Professional and venue-manager roles require a corresponding domain
      // record. Keep the user authenticated, but do not create platform_users
      // until the dedicated registration flow has completed successfully.
      if (requestedType === 'professional') {
        return NextResponse.redirect(new URL('/auth/registar/profissional', origin))
      }

      if (requestedType === 'venue_manager') {
        return NextResponse.redirect(new URL('/auth/registar/espaco', origin))
      }

      // An authenticated identity without a platform profile must explicitly
      // choose the account type instead of being silently classified.
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
