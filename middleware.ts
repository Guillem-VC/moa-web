// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// La teva IP (pots comprovar-la amb https://whatismyipaddress.com)
const ALLOWED_IPS = ['91.126.216.249']

export function middleware(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for")
  const ip = forwardedFor?.split(",")[0].trim() || ""

  if (!ALLOWED_IPS.includes(ip)) {
    const url = req.nextUrl.clone()
    url.pathname = '/maintenance'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

// Aplica a totes les rutes **excepte** _next/static, _next/image, favicon.ico i imatges comunes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(png|jpg|jpeg|gif|svg|webp|ico)).*)'
  ],
}