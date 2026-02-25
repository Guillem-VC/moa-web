// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// La teva IP
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

export const config = {
  matcher: [
    // Middleware a totes les rutes menys les estàtiques de Next i la imatge corporativa
    '/((?!_next/static|_next/image|favicon.ico|foto_corporativa.jpg).*)',
  ],
}