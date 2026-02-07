// app/api/webhook/route.ts
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

  try {
    console.log('[Webhook] Event received:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const order_id = session.metadata?.order_id

      if (!order_id) {
        console.error('[Webhook] Missing order_id in session metadata')
        return NextResponse.json({ error: 'Missing order_id in metadata' }, { status: 400 })
      }

      console.log('[Webhook] Processing order_id:', order_id)

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, user_id, status')
        .eq('id', order_id)
        .single()

      if (orderError || !order) {
        console.error('[Webhook] Order not found:', orderError)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      console.log('[Webhook] Current order status:', order.status)

      if (order.status !== 'pending') {
        console.log('[Webhook] Order already processed, skipping.')
        return NextResponse.json({ received: true })
      }

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('variant_id, quantity')
        .eq('order_id', order.id)

      if (itemsError || !items || items.length === 0) {
        console.error('[Webhook] Order items not found:', itemsError)
        return NextResponse.json({ error: 'Order items not found', status: 500 })
      }

      console.log('[Webhook] Order items found:', items.length)

      // ✅ Actualitzar ordre
      const { error: updateError, data: updatedOrder } = await supabase
        .from('orders')
        .update({ paid_at: new Date().toISOString(), status: 'paid' })
        .eq('id', order.id)
        .eq('status', 'pending')
        .select()

      if (updateError) {
        console.error('[Webhook] Failed to update order:', updateError)
        return NextResponse.json({ error: 'Failed to update order', status: 500 })
      }

      console.log('[Webhook] Order marked as paid:', updatedOrder)

      // ✅ Descomptar stock
      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_variant_stock', {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        })
        if (stockError) console.error('[Webhook] Stock update error for variant', item.variant_id, stockError.message)
      }

      // ✅ Buidar carret
      const { error: cartError } = await supabase.from('cart_items').delete().eq('user_id', order.user_id)
      if (cartError) console.error('[Webhook] Error clearing cart:', cartError)

      console.log(`[Webhook] Order ${order.id} processed successfully`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Webhook] Processing error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
