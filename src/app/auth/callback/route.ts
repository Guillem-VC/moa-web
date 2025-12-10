import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Clau server-safe

const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Exchange code per session
  const { data, error } = await supabaseServer.auth.exchangeCodeForSession(code)
  if (error || !data.session) {
    console.error('Exchange error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const { access_token, refresh_token } = data.session

  const res = NextResponse.redirect(new URL('/user', req.url))

  // Guardem les cookies per middleware
  res.cookies.set('sb-access-token', access_token, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'lax',
  })

  res.cookies.set('sb-refresh-token', refresh_token, {
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'lax',
  })

  return res
}
