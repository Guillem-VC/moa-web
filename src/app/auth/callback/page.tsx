import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const access_token = searchParams.get('access_token')
  const refresh_token = searchParams.get('refresh_token')

  if (!access_token || !refresh_token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const response = NextResponse.redirect(new URL('/', req.url))
  response.cookies.set('sb-access-token', access_token, { path: '/', httpOnly: true, sameSite: 'lax', secure: true })
  response.cookies.set('sb-refresh-token', refresh_token, { path: '/', httpOnly: true, sameSite: 'lax', secure: true })

  return response
}
