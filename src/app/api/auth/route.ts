// api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // només server-side
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return NextResponse.json({ error: 'No auth header' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')

  // Obtenir usuari amb el token
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({ user: data.user })
}
