import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function safeInternalPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = safeInternalPath(searchParams.get('next'), '/dashboard')
  const requestedType = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error, data: sessionData } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && sessionData?.user) {
      // Registration flows may explicitly declare the intended account type.
      // Keep that context, but ordinary social login must never invent a role.
      if (requestedType) {
        const { data: profile } = await supabase
          .from('platform_users')
          .select('type')
          .eq('id', sessionData.user.id)
          .maybeSingle()

        if (!profile?.type) {
          const { error: upsertError } = await supabase
            .from('platform_users')
            .upsert({
              id: sessionData.user.id,
              type: requestedType,
              email: sessionData.user.email,
              full_name: sessionData.user.user_metadata?.full_name || sessionData.user.email?.split('@')[0],
            })

          if (upsertError) {
            return NextResponse.redirect(
              `${origin}/auth/error?error=${encodeURIComponent(upsertError.message || 'Não foi possível criar o perfil.')}`,
            )
          }
        }

        return NextResponse.redirect(new URL(next, origin))
      }

      const resolveUrl = new URL('/auth/resolve', origin)
      resolveUrl.searchParams.set('next', next)
      return NextResponse.redirect(resolveUrl)
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
