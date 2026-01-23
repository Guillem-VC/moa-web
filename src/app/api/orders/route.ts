import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔒 server only
)

export async function POST(req: NextRequest) {
  try {
    const { order_id } = await req.json()

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    // 1️⃣ Obtenir ordre (per saber user_id)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order already processed' }, { status: 400 })
    }
     // 2️⃣ Obtenir order_items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', order.id)

    if (itemsError || !items || items.length === 0) {
      return NextResponse.json({ error: 'Order items not found' }, { status: 500 })
    }

    // 3️⃣ Marcar el paid_at
    const { error: updatePaidAtError  } = await supabase
      .from('orders')
      .update({
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .eq('status', 'pending'); 

    if (updatePaidAtError ) {
      return NextResponse.json({ error: 'Error updating paid_at' }, { status: 500 })
    }

    // 3️⃣ Marcar el status a apaid
    const { error: updateStatusError  } = await supabase
      .from('orders')
      .update({
        status: 'paid',
      })
      .eq('id', order.id)
      .eq('status', 'pending');

    if (updateStatusError ) {
      return NextResponse.json({ error: 'Error updating status' }, { status: 500 })
    }

    // 4️⃣ Descomptar stock per cada variant
    for (const item of items) {
      const { error: stockError } = await supabase.rpc('decrement_variant_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      })

      if (stockError) {
        return NextResponse.json(
          { error: 'Error updating stock', details: stockError.message },
          { status: 500 }
        )
      }
    }

    // 5️⃣ Buidar carret de l’usuari
    const { error: cartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', order.user_id)

    if (cartError) {
      return NextResponse.json({ error: 'Error clearing cart' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
