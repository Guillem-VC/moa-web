// app/api/checkout/create-session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Shipping = {
  email: string
  country: string
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  postalCode: string
  city: string
  province?: string
  phone: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { shipping, items, totalAmount, currency } = body as {
      shipping: Shipping
      items: any[]
      totalAmount: number
      currency?: string
    }

    if (!shipping || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing shipping or items' }, { status: 400 })
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid totalAmount' }, { status: 400 })
    }

    // --------------------------
    // Auth
    // --------------------------
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = userData.user

    // --------------------------
    // Delete old pending sessions for this user
    // --------------------------
    const { error: deleteError } = await supabase
      .from('checkout_sessions')
      .delete()
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (deleteError) {
      console.error('[CreateCheckoutSession] Failed to delete old sessions:', deleteError)
      // No parem el procés, només loguem l’error
    }

    // --------------------------
    // Create checkout session row
    // --------------------------
    const { data: sessionRow, error: insertError } = await supabase
      .from('checkout_sessions')
      .insert({
        user_id: user.id,
        payment_intent_id: null, // important! (ara és nullable)
        status: 'pending',
        total_amount: totalAmount,
        currency: currency || 'eur',
        shipping_info: shipping,
        items,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[CreateCheckoutSession] Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, sessionId: sessionRow.id })
  } catch (err) {
    console.error('[CreateCheckoutSession] Internal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
