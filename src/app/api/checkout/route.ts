import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔑 servei server-side
)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(req: NextRequest) {
  try {

    const body = await req.json()
    const { items } = body as {
      items: { product_id: string; variant_size: string; quantity: number }[]
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Missing auth header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.log('No autenticat', error)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 2️⃣ Validació stock + Stripe line items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    let totalAmount = 0

    for (const item of items) {
      const { data: variant, error: varError } = await supabase
        .from('product_variants')
        .select('id, stock, price_override')
        .eq('product_id', item.product_id)
        .eq('size', item.variant_size)
        .single()

      if (varError || !variant) {
        return NextResponse.json(
          { error: `Variant not found: ${item.product_id} - ${item.variant_size}` },
          { status: 400 }
        )
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficient per ${item.product_id} (${item.variant_size})` },
          { status: 400 }
        )
      }

      const { data: product, error: prodError } = await supabase
        .from('products')
        .select('name, price')
        .eq('id', item.product_id)
        .single()

      if (prodError || !product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product_id}` },
          { status: 400 }
        )
      }

      const unit_price = variant.price_override ?? product.price
      totalAmount += unit_price * item.quantity

      line_items.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(unit_price * 100),
        },
        quantity: item.quantity,
      })
    }

    // 3️⃣ Crear ordre
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total_amount: totalAmount,
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
    }

    // 4️⃣ Order items
    for (const item of items) {
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

      const unit_price = variant?.price_override ?? product?.price ?? 0

      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: variant?.id,
        quantity: item.quantity,
        unit_price,
      })
    }

    // 4️⃣ Crear order_items (snapshot del que es compra)

    // ======================================================
    // 🔥🔥🔥 AQUÍ VA STRIPE CHECKOUT SESSION 🔥🔥🔥
    // ======================================================
    // 👉 Just DESPRÉS de tenir:
    //    - ordre creada (order.id)
    //    - line_items calculats
    //
    // 👉 Aquí:
    //    - create checkout session
    //    - passa order.id a metadata
    //    - retorna checkout_url al client
    //
    // ❌ NO actualitzis status aquí
    // ❌ NO toquis stock aquí
    // ======================================================
   /* STRIPE
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      metadata: {
        order_id: order.id,
      },
    })
    */
    return NextResponse.json({ success: true, order_id: order.id })
    //return NextResponse.json({ success: true, order_id: order.id, url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
