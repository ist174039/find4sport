import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const requestedType = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error, data: sessionData } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && sessionData?.user) {
      let { data: profile } = await supabase
        .from('platform_users')
        .select('type')
        .eq('id', sessionData.user.id)
        .maybeSingle()
        
      if (!profile || !profile.type) {
        if (requestedType) {
          const { error: upsertError } = await supabase
            .from('platform_users')
            .upsert({ 
              id: sessionData.user.id,
              type: requestedType,
              email: sessionData.user.email,
              full_name: sessionData.user.user_metadata?.full_name || sessionData.user.email?.split('@')[0]
            })
          
          if (!upsertError) {
            profile = { type: requestedType }
          }
        } else {
          if (next && next.includes('/auth/registar/')) {
            return NextResponse.redirect(`${origin}${next}`)
          }
          return NextResponse.redirect(`${origin}/auth/registar`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
