// app/api/profiles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔒 només server-side
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, phone, full_name, email } = body as {
      id: string
      phone?: string
      full_name: string
      email: string
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
    }

    // 1️⃣ Comprovar si ja existeix el profile
    const { data: existing, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 = no row found, ignora si no existeix
      return NextResponse.json({ error: 'Error checking profile' }, { status: 500 })
    }

    if (existing) {
      // Ja existeix, no fem res
      return NextResponse.json({ success: true, message: 'Profile already exists' })
    }

    // 2️⃣ Crear el profile
    const { data, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id,
        phone,
        full_name,
        email
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Error creating profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
