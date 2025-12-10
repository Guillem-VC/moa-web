import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { access_token, refresh_token } = await req.json()
  
  console.log("HEADERS:")
  req.headers.forEach((v, k) => console.log(`  ${k}: ${v}`))

  
  console.log("  access_token:", access_token)
  console.log("  refresh_token:", refresh_token)

  const res = NextResponse.json({ ok: true })


  res.cookies.set('sb-access-token', access_token, {
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'none',
  })
  res.cookies.set('sb-refresh-token', refresh_token, {
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'none',
  })

  return res
}
