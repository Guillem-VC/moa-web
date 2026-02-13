import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    console.log(`\n[CreatePaymentIntent][${requestId}] START`)

    const body = await req.json()
    const { sessionId } = body as { sessionId: string }

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    // Auth
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log(`[CreatePaymentIntent][${requestId}] User: ${user.id}`)

    // Load session
    const { data: session, error: sessionError } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'checkout_session not found' }, { status: 404 })
    }

    if (session.status !== 'pending') {
      return NextResponse.json({ error: 'checkout_session not pending' }, { status: 400 })
    }

    // If already exists, reuse immediately
    if (session.payment_intent_id) {
      console.log(`[CreatePaymentIntent][${requestId}] Reusing PI: ${session.payment_intent_id}`)

      const existing = await stripe.paymentIntents.retrieve(session.payment_intent_id)

      return NextResponse.json({
        clientSecret: existing.client_secret,
        paymentIntentId: existing.id,
        reused: true,
      })
    }

    const totalAmount = Number(session.total_amount)
    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid total_amount' }, { status: 400 })
    }

    console.log(`[CreatePaymentIntent][${requestId}] Creating NEW PI...`)

    // Create PI
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: session.currency || 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: user.id,
        checkout_session_id: session.id,
      },
    })

    console.log(`[CreatePaymentIntent][${requestId}] Created PI: ${paymentIntent.id}`)

    // Update only if still null (atomic protection)
    const { data: updatedRows, error: updateError } = await supabase
      .from('checkout_sessions')
      .update({ payment_intent_id: paymentIntent.id })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .is('payment_intent_id', null)
      .select('payment_intent_id')

    if (updateError) {
      console.error(`[CreatePaymentIntent][${requestId}] DB update error`, updateError)
      return NextResponse.json({ error: 'Failed to update checkout session' }, { status: 500 })
    }

    // If update did not affect row -> another request already saved a PI
    if (!updatedRows || updatedRows.length === 0) {
      console.log(`[CreatePaymentIntent][${requestId}] ⚠️ Race detected! Another PI already saved.`)

      // retrieve correct PI from DB
      const { data: latestSession } = await supabase
        .from('checkout_sessions')
        .select('payment_intent_id')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (!latestSession?.payment_intent_id) {
        return NextResponse.json({ error: 'Race condition: PI missing after conflict' }, { status: 500 })
      }

      // optional: cancel the PI we created because it is unused
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id)
        console.log(`[CreatePaymentIntent][${requestId}] Cancelled unused PI: ${paymentIntent.id}`)
      } catch (err) {
        console.warn(`[CreatePaymentIntent][${requestId}] Could not cancel unused PI`, err)
      }

      const existing = await stripe.paymentIntents.retrieve(latestSession.payment_intent_id)

      return NextResponse.json({
        clientSecret: existing.client_secret,
        paymentIntentId: existing.id,
        reused: true,
        raceRecovered: true,
      })
    }

    console.log(`[CreatePaymentIntent][${requestId}] ✅ Saved PI in DB: ${paymentIntent.id}`)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      reused: false,
    })
  } catch (err) {
    console.error(`[CreatePaymentIntent][${requestId}] Internal error:`, err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
