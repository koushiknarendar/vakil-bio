import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

const normalize = (p: string) => p.replace(/^\+/, '')

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  const isManage = hostname.startsWith('manage.')

  // Rewrite manage.vakil.bio → /admin/*
  if (isManage) {
    const { pathname } = request.nextUrl
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      const target = pathname === '/' ? '/admin/sign-in' : `/admin${pathname}`
      return NextResponse.rewrite(new URL(target, request.url))
    }
  }

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

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  // Protect admin routes (except sign-in)
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/sign-in')
  ) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/sign-in', request.url))
    }
    const adminPhones = (process.env.ADMIN_PHONES || '').split(',').map(p => normalize(p.trim()))
    if (!adminPhones.includes(normalize(user.phone ?? ''))) {
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
