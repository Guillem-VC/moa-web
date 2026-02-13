
/*import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server only
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
  line2?: string
  city: string
  postal_code: string
  country: string
  phone: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, shipping } = body as { items: CheckoutItem[]; shipping: Shipping }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }
    if (!shipping) {
      return NextResponse.json({ error: 'Missing shipping info' }, { status: 400 })
    }

    // --------------------------
    // Auth
    // --------------------------
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing auth header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // --------------------------
    // Cancel·lar sessions pendents antigues
    // --------------------------
    /*
    const { data: pendingSessions } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')

    for (const session of pendingSessions ?? []) {
      try {
        await stripe.paymentIntents.cancel(session.payment_intent_id)
        await supabase
          .from('checkout_sessions')
          .update({ status: 'canceled' })
          .eq('id', session.id)
      } catch (err) {
        console.error('[Checkout] Error canceling old session:', err)
      }
    }
    

    // Potser millor al 2
    // --------------------------
    // Validar stock i calcular total
    // --------------------------
    let totalAmount = 0
    for (const item of items) {
      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('id, stock, price_override')
        .eq('product_id', item.product_id)
        .eq('size', item.variant_size)
        .single()

      if (variantError || !variant) {
        return NextResponse.json(
          { error: `Variant not found: ${item.product_id} (${item.variant_size})` },
          { status: 400 }
        )
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficient per producte ${item.product_id} (${item.variant_size})` },
          { status: 400 }
        )
      }

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('price')
        .eq('id', item.product_id)
        .single()

      if (productError || !product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product_id}` },
          { status: 400 }
        )
      }

      const unit_price = variant.price_override ?? product.price ?? 0
      totalAmount += unit_price * item.quantity
    }

    const shippingCost = totalAmount >= 80 ? 0 : 5.99
    const finalAmount = totalAmount + shippingCost

    // Al final del 1
    // --------------------------
    // Actualitzar perfil
    // --------------------------
    /*
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

    if (profileError) {
      console.error('[Checkout] Error updating profile:', profileError)
      return NextResponse.json({ error: 'Error updating profile' }, { status: 500 })
    }

    // Al inici del 2
    // --------------------------
    // Crear PaymentIntent
    // --------------------------
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: { user_id: user.id },
    })

    if (!paymentIntent.client_secret) {
      return NextResponse.json({ error: 'Stripe client secret missing' }, { status: 500 })
    }

    Al inici del 2
    // --------------------------
    // Guardar session a Supabase
    // --------------------------
    const { data: session, error: sessionError } = await supabase
      .from('checkout_sessions')
      .insert({
        user_id: user.id,
        payment_intent_id: paymentIntent.id,
        status: 'pending',
        total_amount: finalAmount,
        currency: 'eur',
        shipping_info: shipping,
        items: items,
      })
      .select()
      .single()

    if (sessionError || !session) {
      console.error('[Checkout] Error creating checkout_session:', sessionError)
      await stripe.paymentIntents.cancel(paymentIntent.id)
      return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
      
  } catch (err) {
    console.error('[Checkout] Internal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
    
}
*/
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type CheckoutItem = {
  product_id: string
  variant_size: string
  quantity: number
}

type Shipping = {
  name: string
  email: string
  line1: string
  line2?: string
  city: string
  postal_code: string
  country: string
  phone: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items } = body as { items: CheckoutItem[] }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // --------------------------
    // Auth
    // --------------------------
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing auth header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // --------------------------
    // Validar stock i calcular total
    // --------------------------
    let totalAmount = 0
    for (const item of items) {
      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('id, stock, price_override')
        .eq('product_id', item.product_id)
        .eq('size', item.variant_size)
        .single()

      if (variantError || !variant) {
        return NextResponse.json(
          { error: `Variant not found: ${item.product_id} (${item.variant_size})` },
          { status: 400 }
        )
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficient per producte ${item.product_id} (${item.variant_size})` },
          { status: 400 }
        )
      }

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('price')
        .eq('id', item.product_id)
        .single()

      if (productError || !product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product_id}` },
          { status: 400 }
        )
      }

      const unit_price = variant.price_override ?? product.price ?? 0
      totalAmount += unit_price * item.quantity
    }

    const shippingCost = totalAmount >= 80 ? 0 : 5.99
    const finalAmount = totalAmount + shippingCost

    // --------------------------
    // Perfil de l'usuari
    // --------------------------
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone, address, city, postal_code, country')
      .eq('id', user.id)
      .single()

    // --------------------------
    // Obtenir cupons disponibles
    // --------------------------
    const now = new Date().toISOString()
    const { data: coupons } = await supabase
      .from('coupons')
      .select('*')
      .eq('active', true)
      .or(`expires_at.is.null,expires_at.gte.${now}`)

    return NextResponse.json({
      totalAmount,
      shippingCost,
      finalAmount,
      profile: profile ?? {},
      coupons: coupons ?? []
    })
  } catch (err) {
    console.error('[Checkout Init] Internal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
