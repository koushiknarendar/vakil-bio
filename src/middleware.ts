import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const isManage = hostname.startsWith('manage.')

  if (isManage) {
    const { pathname } = req.nextUrl

    // Already under /admin — let through
    if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
      return NextResponse.next()
    }

    // Rewrite root to /admin/sign-in
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/admin/sign-in', req.url))
    }

    // Rewrite everything else to /admin/[path]
    return NextResponse.rewrite(new URL(`/admin${pathname}`, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
