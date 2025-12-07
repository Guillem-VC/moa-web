// pages/api/auth/callback.ts
import { createClient } from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // clau privada
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { access_token, refresh_token } = req.query

  // Posa la cookie JWT
  res.setHeader('Set-Cookie', [
    `sb-access-token=${access_token}; Path=/; HttpOnly; SameSite=Lax; Secure`,
    `sb-refresh-token=${refresh_token}; Path=/; HttpOnly; SameSite=Lax; Secure`,
  ])

  res.redirect('/') // redirigeix a la pàgina principal
}
