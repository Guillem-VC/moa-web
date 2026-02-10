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
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  try {
    console.log('[Webhook] Event received:', event.type)

    // =====================================================
    // 1) PAYMENT SUCCEEDED
    // =====================================================
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const paymentIntentId = paymentIntent.id

      console.log('[Webhook] PaymentIntent succeeded:', paymentIntentId)

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

      if (checkoutSession.status === 'paid') {
        console.log('[Webhook] checkout_session already paid, skipping.')
        return NextResponse.json({ received: true })
      }

      if (checkoutSession.status !== 'pending') {
        console.log('[Webhook] checkout_session not pending, skipping. Status:', checkoutSession.status)
        return NextResponse.json({ received: true })
      }

      const userId = checkoutSession.user_id
      const shipping = checkoutSession.shipping_info
      const items = checkoutSession.items
      const totalAmount = checkoutSession.total_amount

      if (!items || items.length === 0) {
        console.error('[Webhook] checkout_session has no items')
        return NextResponse.json({ error: 'No items in checkout_session' }, { status: 500 })
      }

      // 1) Crear order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'paid',
          paid_at: new Date().toISOString(),
          total_amount: totalAmount,
          shipping_info: shipping,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (orderError || !order) {
        console.error('[Webhook] Error creating order:', orderError)
        return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
      }

      console.log('[Webhook] Order created:', order.id)

      // 2) Crear order_items
      for (const item of items) {
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('id, price_override')
          .eq('product_id', item.product_id)
          .eq('size', item.variant_size)
          .single()

        if (variantError || !variant) {
          console.error('[Webhook] Variant not found:', item.product_id, item.variant_size)
          continue
        }

        const { data: product, error: productError } = await supabase
          .from('products')
          .select('price')
          .eq('id', item.product_id)
          .single()

        if (productError || !product) {
          console.error('[Webhook] Product not found:', item.product_id)
          continue
        }

        const unit_price = variant.price_override ?? product.price ?? 0

        const { error: insertItemError } = await supabase.from('order_items').insert({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: variant.id,
          quantity: item.quantity,
          unit_price,
        })

        if (insertItemError) {
          console.error('[Webhook] Error inserting order_item:', insertItemError)
        }
      }

      // 3) Decrement stock
      for (const item of items) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', item.product_id)
          .eq('size', item.variant_size)
          .single()

        if (!variant?.id) continue

        const { error: stockError } = await supabase.rpc('decrement_variant_stock', {
          p_variant_id: variant.id,
          p_quantity: item.quantity,
        })

        if (stockError) {
          console.error('[Webhook] Stock update error:', stockError.message)
        }
      }

      // 4) Clear cart
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)

      if (cartError) {
        console.error('[Webhook] Error clearing cart:', cartError)
      }

      // 5) Mark checkout_session as paid
      const { error: updateSessionError } = await supabase
        .from('checkout_sessions')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          order_id: order.id,
        })
        .eq('id', checkoutSession.id)

      if (updateSessionError) {
        console.error('[Webhook] Error updating checkout_session:', updateSessionError)
      }

      console.log(`[Webhook] Checkout session ${checkoutSession.id} marked as paid.`)

      return NextResponse.json({ received: true })
    }

    // =====================================================
    // 2) PAYMENT FAILED
    // =====================================================
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const paymentIntentId = paymentIntent.id

      console.log('[Webhook] PaymentIntent failed:', paymentIntentId)

      await supabase
        .from('checkout_sessions')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
        })
        .eq('payment_intent_id', paymentIntentId)

      return NextResponse.json({ received: true })
    }

    // =====================================================
    // 3) PAYMENT CANCELED
    // =====================================================
    if (event.type === 'payment_intent.canceled') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const paymentIntentId = paymentIntent.id

      console.log('[Webhook] PaymentIntent canceled:', paymentIntentId)

      await supabase
        .from('checkout_sessions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
        })
        .eq('payment_intent_id', paymentIntentId)

      return NextResponse.json({ received: true })
    }

    // =====================================================
    // DEFAULT
    // =====================================================
    console.log('[Webhook] Event type not handled:', event.type)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Webhook] Processing error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
