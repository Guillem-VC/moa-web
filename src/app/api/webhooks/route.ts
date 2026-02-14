// app/api/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    console.error('[Webhook] Missing Stripe signature')
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const now = new Date().toISOString()

  try {
    console.log('[Webhook] Event received:', event.type)

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const paymentIntentId = paymentIntent.id

      // Buscar checkout_session amb payment_intent_id
      const { data: checkoutSession, error: sessionError } = await supabase
        .from('checkout_sessions')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .single()

      if (sessionError || !checkoutSession) {
        console.error('[Webhook] checkout_session not found:', sessionError)
        return NextResponse.json({ error: 'checkout_session not found' }, { status: 404 })
      }

      const userId = checkoutSession.user_id
      const items =
        typeof checkoutSession.items === 'string'
          ? JSON.parse(checkoutSession.items)
          : checkoutSession.items ?? []

      const shipping =
        typeof checkoutSession.shipping_info === 'string'
          ? JSON.parse(checkoutSession.shipping_info)
          : checkoutSession.shipping_info ?? {}
      const totalAmount = checkoutSession.total_amount

      // 1) Crear ordre com pending
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'pending',
          total_amount: totalAmount,
          shipping_info: shipping,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (orderError || !order) {
        console.error('[Webhook] Error creating order:', orderError)
        return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
      }

      // 2) Crear order_items i decrementar stock
      for (const item of items) {
        try {
          const { data: variant } = await supabase
            .from('product_variants')
            .select('id, price_override')
            .eq('product_id', item.product_id)
            .eq('size', item.variant_size)
            .single()

          const { data: product } = await supabase
            .from('products')
            .select('price')
            .eq('id', item.product_id)
            .single()

          if (!variant?.id || !product?.price) continue

          await supabase.from('order_items').insert({
            order_id: order.id,
            product_id: item.product_id,
            variant_id: variant.id,
            quantity: item.quantity,
            unit_price: variant.price_override ?? product.price ?? 0,
          })

          await supabase.rpc('decrement_variant_stock', {
            p_variant_id: variant.id,
            p_quantity: item.quantity,
          })
        } catch (err) {
          console.error('[Webhook] Error processing item:', err)
        }
      }

      // 3) petit delay
      await delay(400)

      // 4) Actualitzar ordre a paid
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      return NextResponse.json({ received: true })
    }

    if (['payment_intent.payment_failed', 'payment_intent.canceled'].includes(event.type)) {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const status = event.type === 'payment_intent.payment_failed' ? 'failed' : 'canceled'

      await supabase
        .from('checkout_sessions')
        .update({
          status,
          failed_at: status === 'failed' ? now : null,
          canceled_at: status === 'canceled' ? now : null,
        })
        .eq('payment_intent_id', paymentIntent.id)

      console.log(`[Webhook] PaymentIntent ${paymentIntent.id} marked as ${status}.`)
      return NextResponse.json({ received: true })
    }

    console.log('[Webhook] Event type not handled:', event.type)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Webhook] Processing error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
