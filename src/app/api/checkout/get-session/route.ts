import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 important
)

type Shipping = {
  email: string
  country: string
  firstName: string
  lastName: string
  company: string
  address1: string
  address2: string
  postalCode: string
  city: string
  province: string
  phone: string
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const sessionId = url.searchParams.get('sessionId')

    console.log('[get-session] sessionId param:', sessionId)

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization')
    console.log('[get-session] auth header:', authHeader?.slice(0, 25) + '...')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    console.log('[get-session] getUser result:', userData, 'error:', userError)

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = userData.user.id
    console.log('[get-session] userId:', userId)

    const { data: session, error: sessionError } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .maybeSingle()

    console.log('[get-session] session query result:', session, 'error:', sessionError)

    if (sessionError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const shipping: Shipping = session.shipping_info as Shipping
    const totalAmount: number = Number(session.total_amount)

    return NextResponse.json({ shipping, totalAmount })
  } catch (err) {
    console.error('[get-session] unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
