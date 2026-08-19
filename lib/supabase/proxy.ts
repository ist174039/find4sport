import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function clearSupabaseCookies(request: NextRequest, response: NextResponse) {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith('sb-')) response.cookies.delete(cookie.name)
  }
  return response
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const pathname = request.nextUrl.pathname
  let user = null

  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error: unknown) {
    const code = typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : ''

    if (code !== 'refresh_token_not_found') throw error

    // A stale browser refresh token is an expired local session, not an
    // application failure. Clear Supabase cookies so the next request starts
    // from a clean anonymous state instead of repeatedly throwing in proxy.
    supabaseResponse = clearSupabaseCookies(request, NextResponse.next({ request }))
  }

  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return clearSupabaseCookies(request, NextResponse.redirect(url))
    }

    const { data: profile } = await supabase
      .from('platform_users')
      .select('type')
      .eq('id', user.id)
      .single()

    if (!profile) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/registar'
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return clearSupabaseCookies(request, NextResponse.redirect(url))
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('admin_type')
      .eq('auth_user_id', user.id)
      .single()

    if (!admin) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/admin/utilizadores') || pathname.startsWith('/admin/api-keys')) {
      if (admin.admin_type !== 'general') {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
