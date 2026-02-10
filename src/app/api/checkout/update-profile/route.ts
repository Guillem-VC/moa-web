// File: /app/api/checkout/update-profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server only
)

type Shipping = {
  name: string
  email: string
  line1: string
  line2?: string
  city: string
  postal_code: string
  country: string
  phone: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shipping } = body as { shipping: Shipping }

    // Validació bàsica
    if (!shipping) {
      return NextResponse.json({ error: 'Shipping info missing' }, { status: 400 })
    }

    const requiredFields: (keyof Shipping)[] = [
      'name',
      'email',
      'line1',
      'city',
      'postal_code',
      'country',
      'phone',
    ]
    const missingField = requiredFields.find((f) => !shipping[f] || shipping[f].trim() === '')
    if (missingField) {
      return NextResponse.json({ error: `Missing field: ${missingField}` }, { status: 400 })
    }

    // --------------------------
    // Autenticació
    // --------------------------
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // --------------------------
    // Actualitzar perfil
    // --------------------------
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: shipping.name,
      email: shipping.email,
      phone: shipping.phone,
      address: `${shipping.line1}${shipping.line2 ? ' ' + shipping.line2 : ''}`,
      city: shipping.city,
      postal_code: shipping.postal_code,
      country: shipping.country,
    })

    if (profileError) {
      console.error('[UpdateProfile] Error updating profile:', profileError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[UpdateProfile] Internal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
