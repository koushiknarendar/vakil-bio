import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

const normalize = (p: string) => p.replace(/^\+/, '')

function isAdminUser(user: { phone?: string | null } | null) {
  if (!user) return false
  const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => normalize(p.trim()))
  return adminPhones.includes(normalize(user.phone ?? ''))
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  const isManage = hostname.startsWith('manage.')

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── manage.vakil.bio subdomain ──────────────────────────────────────────
  // Rewrite root URL to the right admin page; all other paths pass through
  if (isManage) {
    const { pathname } = request.nextUrl
    if (pathname === '/') {
      const target = isAdminUser(user) ? '/admin' : '/admin/sign-in'
      return NextResponse.rewrite(new URL(target, request.url))
    }
    // /admin/*, /api/*, /_next/*, and any other path — pass through
    return supabaseResponse
  }

  // ── Main site ────────────────────────────────────────────────────────────

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  // Protect admin routes on main site (except sign-in)
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/sign-in')
  ) {
    if (!isAdminUser(user)) {
      return NextResponse.redirect(new URL('/admin/sign-in', request.url))
    }
  }

  // Redirect authenticated users away from auth login page
  if (request.nextUrl.pathname === '/auth/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
