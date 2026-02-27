// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Llegim les IPs autoritzades de l'entorn (.env.local)
const ALLOWED_IPS = process.env.ALLOWED_IPS?.split(',') || []

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Excloem el webhook de Stripe
  if (pathname.startsWith('/api/webhooks')) {
    return NextResponse.next()
  }
  const forwardedFor = req.headers.get("x-forwarded-for")
  const ip = forwardedFor?.split(",")[0].trim() || ""

  if (!ALLOWED_IPS.includes(ip)) {
    const url = req.nextUrl.clone()
    url.pathname = '/maintenance'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

// Excloem rutes estàtiques i la imatge corporativa
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|foto_corporativa.jpg).*)',
  ],
}