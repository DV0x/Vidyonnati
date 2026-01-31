import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not use getSession() here. getUser() sends a request to
  // the Supabase Auth server to revalidate the token and refresh cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Routes that require authentication
  const protectedPrefixes = ['/dashboard', '/admin', '/apply', '/spotlight/apply']
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  )

  // Routes that authenticated users should be redirected away from
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthRoute && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard'
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = redirectTo
    redirectUrl.searchParams.delete('redirect')
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
