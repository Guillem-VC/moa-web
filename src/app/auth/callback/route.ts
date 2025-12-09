import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const access_token = searchParams.get('access_token')
  const refresh_token = searchParams.get('refresh_token')

  // Si no hi ha tokens → torna al login
  if (!access_token || !refresh_token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirigeix a l'usuari
  const res = NextResponse.redirect(new URL('/user', req.url))

  // Escriu cookies perquè Supabase client-side les pugui llegir
  res.cookies.set('sb-access-token', access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  })

  res.cookies.set('sb-refresh-token', refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  })

  return res
}
