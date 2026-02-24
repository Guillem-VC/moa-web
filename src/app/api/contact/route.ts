import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'


export async function POST(req: Request) {
  try {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const body = await req.json()
    const { name, email, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    if (message.length > 1000) {
        return NextResponse.json(
            { error: 'Message too long' },
            { status: 400 }
        )
    }

    const { error } = await supabase
      .from('contact_messages')
      .insert([{ name, email, subject, message }])

    if (error) {
      console.error(error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}