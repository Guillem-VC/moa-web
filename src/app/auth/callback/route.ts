import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  console.log('Callback called', req.url) // <--- comprova a Vercel logs
  const { searchParams } = new URL(req.url)
  const access_token = searchParams.get('access_token')
  const refresh_token = searchParams.get('refresh_token')

  if (!access_token || !refresh_token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const res = NextResponse.redirect(new URL('/user', req.url))

  // Cookie server-side que pugui llegir el middleware
  res.cookies.set({
    name: 'sb-access-token',
    value: access_token,
    httpOnly: true,
    path: '/',
    secure: true,       // obliga HTTPS en prod
    sameSite: 'lax',    // l’ideal és 'lax'
  })

  res.cookies.set({
    name: 'sb-refresh-token',
    value: refresh_token,
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'lax',
  })

  return res
}
