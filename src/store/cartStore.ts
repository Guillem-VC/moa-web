import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'

export interface CartItem {
  id: string
  product_id: string
  name: string
  price: number
  image_url: string
  variant_size: string
  quantity: number
}

export interface AddCartItem {
  product_id: string
  variant_size: string
  quantity: number
}

export interface CartState {
  items: CartItem[]
  loadCart: () => Promise<void>
  addToCart: (item: AddCartItem) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  clearCart: () => Promise<void>
  resetCart: () => void
  updateQuantity: (itemId: string, newQuantity: number) => Promise<void> // ✅ afegit
  syncCartWithSupabase: () => Promise<void> // ✅ ja hi era
  fetchStockForItems: () => Promise<Record<string, number>> // 👈 nou
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  loadCart: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('cart_items')
      .select('id, product_id, variant_size, quantity')
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      return
    }

    const items = await Promise.all(
      data.map(async (row: any) => {
        const { data: prod } = await supabase
          .from('products')
          .select('name, price, image_url')
          .eq('id', row.product_id)
          .single()

        return {
          id: row.id,
          product_id: row.product_id,
          variant_size: row.variant_size,
          quantity: row.quantity,
          name: prod?.name || 'Producte desconegut',
          price: prod?.price || 0,
          image_url: prod?.image_url || 'https://via.placeholder.com/150',
        }
      })
    )

    set({ items })
  },

  updateQuantity: async (itemId, newQuantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ),
    }))

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('cart_items') // ✅ correcció
        .update({ quantity: newQuantity })
        .eq('id', itemId)
        .eq('user_id', user.id)
    } else {
      localStorage.setItem('cart_items', JSON.stringify(get().items))
    }
  },

  addToCart: async (item: AddCartItem) => {
    const { data: { user } } = await supabase.auth.getUser()
    const existing = get().items.find(
      (i) => i.product_id === item.product_id && i.variant_size === item.variant_size
    )

    if (existing) {
      const newQty = existing.quantity + item.quantity

      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQty })
          .eq('user_id', user.id)
          .eq('product_id', item.product_id)
          .eq('variant_size', item.variant_size)
        if (error) console.error(error)
      }

      set((state) => ({
        items: state.items.map(i =>
          i.product_id === item.product_id && i.variant_size === item.variant_size
            ? { ...i, quantity: newQty }
            : i
        ),
      }))
      return
    }

    const { data: prod } = await supabase
      .from('products')
      .select('name, price, image_url')
      .eq('id', item.product_id)
      .single()

    const prodData = prod || { name: 'Producte desconegut', price: 0, image_url: 'https://via.placeholder.com/150' }

    const newItem: CartItem = {
      id: user ? crypto.randomUUID() : `tmp-${Date.now()}`,
      product_id: item.product_id,
      variant_size: item.variant_size,
      quantity: item.quantity,
      name: prodData.name,
      price: prodData.price,
      image_url: prodData.image_url,
    }

    if (user) {
      const { error } = await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: item.product_id,
        variant_size: item.variant_size,
        quantity: item.quantity,
      })
      if (error) console.error(error)
    }

    set((state) => ({ items: [...state.items, newItem] }))
  },

  removeFromCart: async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('cart_items').delete().eq('id', id)
      if (error) console.error(error)
    }
    set((state) => ({ items: state.items.filter(i => i.id !== id) }))
  },

  clearCart: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id)
      if (error) console.error(error)
    }
    set({ items: [] })
  },

  resetCart: () => set({ items: [] }),

  syncCartWithSupabase: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  
    const guestCartRaw = localStorage.getItem('cart_items')
    const guestItems: AddCartItem[] = guestCartRaw ? JSON.parse(guestCartRaw) : []
  
    for (const item of guestItems) {
      const { data: existing, error } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', item.product_id)
        .eq('variant_size', item.variant_size)
        .maybeSingle()
  
      if (error) {
        console.error(error)
        continue
      }
  
      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + item.quantity })
          .eq('id', existing.id)
      } else {
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: item.product_id,
          variant_size: item.variant_size,
          quantity: item.quantity,
        })
      }
    }
  
    // Un cop sincronitzat, eliminem el carrito local
    localStorage.removeItem('cart_items')
  
    // Carreguem el carrito complet de Supabase al state
    await get().loadCart()
  },
  
  fetchStockForItems: async () => {
    const items = get().items
    const stockMap: Record<string, number> = {}

    for (const item of items) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('product_id', item.product_id)
        .eq('size', item.variant_size)
        .single()

      stockMap[item.product_id + '_' + item.variant_size] = variant?.stock ?? 0
    }

    return stockMap
  },
}))
