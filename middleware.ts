import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const access = req.cookies.get('sb-access-token')?.value

  // si entra a /user i NO té sessió → login
  if (req.nextUrl.pathname.startsWith('/user') && !access) {
    return NextResponse.redirect(new URL('/about', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/user/:path*'],
}
