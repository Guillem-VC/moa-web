// app/api/checkout/validate-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role per evitar RLS
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const paymentIntentId = searchParams.get('payment_intent')

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Missing payment_intent' }, { status: 400 })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      // Marcar checkout_session com a paid
      let sessionId: string | null = null
      try {
        const now = new Date().toISOString()
        const { data: updatedSession, error: updateError } = await supabase
          .from('checkout_sessions')
          .update({
            status: 'paid',
            paid_at: now,
            updated_at: now,
          })
          .eq('payment_intent_id', paymentIntentId)
          .select()
          .single()

        if (updateError) {
          console.error('[ValidatePaymentIntent] Failed to mark checkout_session as paid:', updateError)
        } else {
          console.log(`[ValidatePaymentIntent] checkout_session ${updatedSession.id} marked as paid.`)
          sessionId = updatedSession.id
        }
      } catch (err) {
        console.error('[ValidatePaymentIntent] Exception marking checkout_session as paid:', err)
      }

      return NextResponse.json({ valid: true })
    } else {
      return NextResponse.json({ valid: false })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
