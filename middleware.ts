import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value

  console.log('PATH:', req.nextUrl.pathname)
  console.log('COOKIE:', token)

  if (req.nextUrl.pathname.startsWith('/user') && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/user/:path*'],
}
