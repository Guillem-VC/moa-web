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

    // ------------------------
    // PAYMENT SUCCEEDED
    // ------------------------
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const paymentIntentId = paymentIntent.id

      // Buscar checkout_session
      const { data: checkoutSession, error: sessionError } = await supabase
        .from('checkout_sessions')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .single()

      if (sessionError || !checkoutSession) {
        console.error('[Webhook] checkout_session not found:', sessionError)
        return NextResponse.json({ error: 'checkout_session not found' }, { status: 404 })
      }

      // Protecció: si ja té order_id o està pagada, sortim
      if (checkoutSession.order_id || checkoutSession.status === 'paid') {
        console.log('[Webhook] checkout_session already processed, skipping.')
        return NextResponse.json({ received: true })
      }

      if (checkoutSession.status !== 'pending') {
        console.log('[Webhook] checkout_session not pending, skipping. Status:', checkoutSession.status)
        return NextResponse.json({ received: true })
      }

      const userId = checkoutSession.user_id
      const items = checkoutSession.items
      const shipping = checkoutSession.shipping_info
      const totalAmount = checkoutSession.total_amount

      if (!userId || !items?.length) {
        console.error('[Webhook] Invalid checkout_session data')
        return NextResponse.json({ error: 'Invalid checkout_session' }, { status: 500 })
      }

      // ------------------------
      // Crear ordre
      // ------------------------
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'paid',
          paid_at: now,
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

      // ------------------------
      // Crear order_items
      // ------------------------
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
        } catch (err) {
          console.error('[Webhook] Error creating order_item:', err)
        }
      }

      // ------------------------
      // Decrement stock
      // ------------------------
      for (const item of items) {
        try {
          const { data: variant } = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', item.product_id)
            .eq('size', item.variant_size)
            .single()

          if (!variant?.id) continue

          await supabase.rpc('decrement_variant_stock', {
            p_variant_id: variant.id,
            p_quantity: item.quantity,
          })
        } catch (err) {
          console.error('[Webhook] Error decrementing stock:', err)
        }
      }

      // ------------------------
      // Clear cart
      // ------------------------
      await supabase.from('cart_items').delete().eq('user_id', userId)

      // ------------------------
      // Mark checkout_session as paid
      // ------------------------
      await supabase.from('checkout_sessions')
        .update({
          status: 'paid',
          paid_at: now,
          order_id: order.id,
        })
        .eq('id', checkoutSession.id)

      console.log(`[Webhook] Checkout session ${checkoutSession.id} marked as paid.`)
      return NextResponse.json({ received: true })
    }

    // ------------------------
    // PAYMENT FAILED
    // ------------------------
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await supabase.from('checkout_sessions')
        .update({ status: 'failed', failed_at: now })
        .eq('payment_intent_id', paymentIntent.id)

      console.log(`[Webhook] PaymentIntent ${paymentIntent.id} marked as failed.`)
      return NextResponse.json({ received: true })
    }

    // ------------------------
    // PAYMENT CANCELED
    // ------------------------
    if (event.type === 'payment_intent.canceled') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await supabase.from('checkout_sessions')
        .update({ status: 'canceled', canceled_at: now })
        .eq('payment_intent_id', paymentIntent.id)

      console.log(`[Webhook] PaymentIntent ${paymentIntent.id} marked as canceled.`)
      return NextResponse.json({ received: true })
    }

    // ------------------------
    // DEFAULT
    // ------------------------
    console.log('[Webhook] Event type not handled:', event.type)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Webhook] Processing error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
