import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

type CheckoutItem = {
  product_id: string
  variant_size: string
  quantity: number
}

type Shipping = {
  name: string
  email: string
  line1: string
  line2: string
  city: string
  postal_code: string
  country: string
  phone: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, shipping } = body as { items: CheckoutItem[]; shipping: Shipping }

    if (!items || items.length === 0) return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    if (!shipping) return NextResponse.json({ error: 'Missing shipping info' }, { status: 400 })

    // Auth
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Missing auth header' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // 1) Calcula total i crea line_items (opcional si vols usar per estadístiques)
    let totalAmount = 0
    for (const item of items) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('id, stock, price_override')
        .eq('product_id', item.product_id)
        .eq('size', item.variant_size)
        .single()

      if (!variant || variant.stock < item.quantity)
        return NextResponse.json({ error: `Stock insuficient: ${item.product_id}` }, { status: 400 })

      const { data: product } = await supabase.from('products').select('price').eq('id', item.product_id).single()
      const unit_price = variant?.price_override ?? product?.price ?? 0
      totalAmount += unit_price * item.quantity
    }

    const shippingCost = totalAmount >= 80 ? 0 : 5.99
    const finalAmount = totalAmount + shippingCost

    // 2) Update profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: shipping.name,
      email: shipping.email,
      phone: shipping.phone,
      address: `${shipping.line1}${shipping.line2 ? ' ' + shipping.line2 : ''}`,
      city: shipping.city,
      postal_code: shipping.postal_code,
      country: shipping.country,
    })

    if (profileError) return NextResponse.json({ error: 'Error updating profile' }, { status: 500 })

    // 3) Crear ordre
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total_amount: finalAmount,
        shipping_info: shipping,
      })
      .select()
      .single()

    if (orderError || !order) return NextResponse.json({ error: 'Error creating order' }, { status: 500 })

    // 4) Crear order_items
    for (const item of items) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('id, price_override')
        .eq('product_id', item.product_id)
        .eq('size', item.variant_size)
        .single()

      const { data: product } = await supabase.from('products').select('price').eq('id', item.product_id).single()
      const unit_price = variant?.price_override ?? product?.price ?? 0

      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: variant?.id,
        quantity: item.quantity,
        unit_price,
      })
    }

    // 5) Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: { order_id: order.id, user_id: user.id },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, orderId: order.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
