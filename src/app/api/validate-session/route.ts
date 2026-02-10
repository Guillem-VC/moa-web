import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('checkout_sessions')
    .select('id,status')
    .eq('stripe_session_id', sessionId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  if (data.status !== 'paid') {
    return NextResponse.json({ error: 'Not paid' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
