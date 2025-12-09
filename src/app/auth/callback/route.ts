import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  console.log('Callback called', req.url)
  const { searchParams } = new URL(req.url)
  const access_token = searchParams.get('access_token')
  const refresh_token = searchParams.get('refresh_token')

  if (!access_token || !refresh_token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Generem una resposta HTML manualment
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Redirigint...</title>
        <script>
          window.location.href = '/user';
        </script>
      </head>
      <body>
        <p>Redirigint a l'àrea d'usuari...</p>
      </body>
    </html>
  `

  const res = new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      // Set-Cookie manual, HTTP only, secure
      'Set-Cookie': [
        `sb-access-token=${access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`,
        `sb-refresh-token=${refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax`,
      ].join(', '),
    },
  })

  return res
}
