import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Intercanvia el code per access_token i refresh_token
  const tokenRes = await fetch(`https://dqoihydizvfnfnbrsauf.supabase.co/auth/v1/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // o service_role si cal
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://moa-web-v1.vercel.app/auth/callback',
    }),
  })

  const tokens = await tokenRes.json()

  if (!tokens.access_token || !tokens.refresh_token) {
    console.error('No tokens returned:', tokens)
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Posa els tokens en cookies server-side
  const res = NextResponse.redirect(new URL('/user', req.url))
  res.cookies.set('sb-access-token', tokens.access_token, {
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'lax',
  })
  res.cookies.set('sb-refresh-token', tokens.refresh_token, {
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'lax',
  })

  return res
}
