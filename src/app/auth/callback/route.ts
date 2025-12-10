import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const provider = url.searchParams.get('provider') // opcional, si vols suportar més d'un provider

  if (!code) {
    console.log('No code in callback URL')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Intercanvia el code per access_token i refresh_token amb Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // necessites la service role key
  const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=authorization_code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      apiKey: supabaseKey!,
      Authorization: `Bearer ${supabaseKey!}`,
    },
    body: new URLSearchParams({ code, redirect_uri: `${url.origin}/auth/callback` }),
  })

  if (!tokenRes.ok) {
    console.log('Error fetching tokens from Supabase')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const tokens = await tokenRes.json()
  const access_token = tokens.access_token
  const refresh_token = tokens.refresh_token

  if (!access_token || !refresh_token) {
    console.log('Tokens missing from Supabase response', tokens)
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const res = NextResponse.redirect(new URL('/user', req.url))

  // Posa cookies que el middleware pugui llegir
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

  console.log('OAuth callback: cookies set, redirecting to /user')
  return res
}
