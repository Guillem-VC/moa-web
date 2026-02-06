import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔒 server only
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
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
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  try {
    // ✅ Pagament confirmat amb Checkout
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const order_id = session.metadata?.order_id

      if (!order_id) {
        console.error('Missing order_id in metadata')
        return NextResponse.json({ error: 'Missing order_id in metadata' }, { status: 400 })
      }

      // 1️⃣ Obtenir ordre
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, user_id, status')
        .eq('id', order_id)
        .single()

      if (orderError || !order) {
        console.error('Order not found:', orderError)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // ⚠️ Evitar duplicats (Stripe pot reenviar events)
      if (order.status !== 'pending') {
        console.log(`Order ${order.id} already processed, skipping...`)
        return NextResponse.json({ received: true })
      }

      // 2️⃣ Obtenir order_items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('variant_id, quantity')
        .eq('order_id', order.id)

      if (itemsError || !items || items.length === 0) {
        console.error('Order items not found:', itemsError)
        return NextResponse.json({ error: 'Order items not found' }, { status: 500 })
      }

      // 3️⃣ Marcar paid_at
      const { error: updatePaidAtError } = await supabase
        .from('orders')
        .update({
          paid_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .eq('status', 'pending')

      if (updatePaidAtError) {
        console.error('Error updating paid_at:', updatePaidAtError)
        return NextResponse.json({ error: 'Error updating paid_at' }, { status: 500 })
      }

      // 4️⃣ Marcar status a paid
      const { error: updateStatusError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
        })
        .eq('id', order.id)
        .eq('status', 'pending')

      if (updateStatusError) {
        console.error('Error updating status:', updateStatusError)
        return NextResponse.json({ error: 'Error updating status' }, { status: 500 })
      }

      // 5️⃣ Descomptar stock per cada variant
      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_variant_stock', {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        })

        if (stockError) {
          console.error('Error updating stock:', stockError)
          return NextResponse.json(
            { error: 'Error updating stock', details: stockError.message },
            { status: 500 }
          )
        }
      }

      // 6️⃣ Buidar carret de l’usuari
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', order.user_id)

      if (cartError) {
        console.error('Error clearing cart:', cartError)
        return NextResponse.json({ error: 'Error clearing cart' }, { status: 500 })
      }

      console.log(`✅ Order ${order.id} processed successfully`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
