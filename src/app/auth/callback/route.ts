import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Supabase ja processa el callback automàticament.
  // Només redirigim a on toca.
  return NextResponse.redirect(new URL('/', request.url))
}
