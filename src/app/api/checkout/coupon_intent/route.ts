// app/api/checkout/coupon_intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
    console.log('[Coupon API] Request body:', body)
  } catch (err) {
    console.error('[Coupon API] Error parsing JSON body:', err)
    return NextResponse.json(
      { discountAmount: 0, finalTotal: 0, message: 'Invalid request body' },
      { status: 400 }
    )
  }

  try {
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    const total = Number(body.total) || 0
    const shippingCost = Number(body.shippingCost) || 0

    if (!code) {
      console.log('[Coupon API] No coupon code provided')
      return NextResponse.json(
        { discountAmount: 0, finalTotal: total + shippingCost, message: 'No coupon code provided' },
        { status: 400 }
      )
    }

    const couponCode = code.toUpperCase()
    console.log('[Coupon API] Checking coupon code (uppercased):', couponCode)

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('active', true)
      .maybeSingle()

    if (error) {
      console.error('[Coupon API] Supabase error:', error)
      return NextResponse.json(
        { discountAmount: 0, finalTotal: total + shippingCost, message: 'Error validating coupon' },
        { status: 500 }
      )
    }

    console.log('[Coupon API] Supabase returned data:', data)

    if (!data) {
      console.log('[Coupon API] Coupon not found or inactive')
      return NextResponse.json(
        { discountAmount: 0, finalTotal: total + shippingCost, message: 'Invalid coupon' },
        { status: 400 }
      )
    }

    const coupon = data as {
      id: string
      code: string
      type: 'percent' | 'fixed' | 'free_shipping'
      value: number
      min_order: number
      expires_at: string | null
    }

    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
      console.log('[Coupon API] Coupon expired:', coupon.expires_at)
      return NextResponse.json(
        { discountAmount: 0, finalTotal: total + shippingCost, message: 'Coupon expired' },
        { status: 400 }
      )
    }

    if (total < coupon.min_order) {
      console.log('[Coupon API] Total below minimum for coupon:', coupon.min_order)
      return NextResponse.json(
        {
          discountAmount: 0,
          finalTotal: total + shippingCost,
          message: `Minimum order required: €${coupon.min_order.toFixed(2)}`,
        },
        { status: 400 }
      )
    }

    let discount = 0
    if (coupon.type === 'percent') discount = total * (coupon.value / 100)
    else if (coupon.type === 'fixed') discount = coupon.value
    else if (coupon.type === 'free_shipping') discount = shippingCost

    if (discount > total + shippingCost) discount = total + shippingCost

    const finalTotal = total + shippingCost - discount
    console.log('[Coupon API] Discount applied:', discount, 'Final total:', finalTotal)

    return NextResponse.json({ discountAmount: discount, finalTotal })
  } catch (err) {
    console.error('[Coupon API] Unexpected error:', err)
    return NextResponse.json(
      { discountAmount: 0, finalTotal: 0, message: 'Unexpected error' },
      { status: 500 }
    )
  }
}
