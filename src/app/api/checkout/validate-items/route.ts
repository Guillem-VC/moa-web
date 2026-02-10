import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items } = body

    if (!items || !items.length) return NextResponse.json({ error: 'No items' }, { status: 400 })

    // Auth
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Missing auth' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    // Validar stock
    for (const item of items) {
      const { data: variant, error } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('product_id', item.product_id)
        .eq('size', item.variant_size)
        .single()
      if (error || !variant) return NextResponse.json({ error: 'Variant not found' }, { status: 400 })
      if (variant.stock < item.quantity) return NextResponse.json({ error: 'Stock insuficient' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
