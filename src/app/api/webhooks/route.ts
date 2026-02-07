// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs' // Important!

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text() // raw text
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const order_id = session.metadata?.order_id
      if (!order_id) return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, user_id, status')
        .eq('id', order_id)
        .single()

      if (orderError || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      if (order.status !== 'pending') return NextResponse.json({ received: true })

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('variant_id, quantity')
        .eq('order_id', order.id)

      if (itemsError || !items) return NextResponse.json({ error: 'Order items not found' }, { status: 500 })

      await supabase
        .from('orders')
        .update({ paid_at: new Date().toISOString(), status: 'paid' })
        .eq('id', order.id)
        .eq('status', 'pending')

      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_variant_stock', {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        })
        if (stockError) console.error('Stock error:', stockError.message)
      }

      await supabase.from('cart_items').delete().eq('user_id', order.user_id)

      console.log(`✅ Order ${order.id} processed successfully`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
