import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'

/* =======================
   Tipus
======================= */

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
  updateQuantity: (itemId: string, newQuantity: number) => Promise<void>
  syncCartWithSupabase: () => Promise<void>
  fetchStockForItems: () => Promise<Record<string, number>>
}

/* =======================
   Local storage helpers
======================= */

const LOCAL_CART_KEY = 'cart_items'

const loadLocalCart = (): CartItem[] => {
  const raw = localStorage.getItem(LOCAL_CART_KEY)
  return raw ? JSON.parse(raw) : []
}

const saveLocalCart = (items: CartItem[]) => {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items))
}

const clearLocalCart = () => {
  localStorage.removeItem(LOCAL_CART_KEY)
}

const CART_SYNC_KEY = 'cart_synced_after_login'

/* =======================
   Store
======================= */

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  /* ---------- LOAD ---------- */

  loadCart: async () => {
    const { data: { user } } = await supabase.auth.getUser()

    // GUEST → localStorage
    if (!user) {
      set({ items: loadLocalCart() })
      return
    }

    // USER → Supabase
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, product_id, variant_size, quantity')
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      return
    }

    const items = await Promise.all(
      data.map(async (row) => {
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
          name: prod?.name ?? 'Producte desconegut',
          price: prod?.price ?? 0,
          image_url: prod?.image_url ?? 'https://via.placeholder.com/150',
        }
      })
    )

    set({ items })
  },

  /* ---------- ADD ---------- */

  addToCart: async (item) => {
    const { data: { user } } = await supabase.auth.getUser()
    const stateItems = get().items

    const existing = stateItems.find(
      i => i.product_id === item.product_id && i.variant_size === item.variant_size
    )

    // Ja existeix
    if (existing) {
      const newQty = existing.quantity + item.quantity

      if (user) {
        await supabase
          .from('cart_items')
          .update({ quantity: newQty })
          .eq('id', existing.id)
      }

      const updatedItems = stateItems.map(i =>
        i.id === existing.id ? { ...i, quantity: newQty } : i
      )

      set({ items: updatedItems })
      if (!user) saveLocalCart(updatedItems)
      return
    }

    // Nou item
    const { data: prod } = await supabase
      .from('products')
      .select('name, price, image_url')
      .eq('id', item.product_id)
      .single()

    const newItem: CartItem = {
      id: user ? crypto.randomUUID() : `tmp-${Date.now()}`,
      product_id: item.product_id,
      variant_size: item.variant_size,
      quantity: item.quantity,
      name: prod?.name ?? 'Producte desconegut',
      price: prod?.price ?? 0,
      image_url: prod?.image_url ?? 'https://via.placeholder.com/150',
    }

    if (user) {
      await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: item.product_id,
        variant_size: item.variant_size,
        quantity: item.quantity,
      })
    }

    const updatedItems = [...stateItems, newItem]
    set({ items: updatedItems })
    if (!user) saveLocalCart(updatedItems)
  },

  /* ---------- UPDATE ---------- */

  updateQuantity: async (itemId, newQuantity) => {
    const { data: { user } } = await supabase.auth.getUser()

    const updatedItems = get().items.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )

    set({ items: updatedItems })

    if (user) {
      await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId)
    } else {
      saveLocalCart(updatedItems)
    }
  },

  /* ---------- REMOVE ---------- */

  removeFromCart: async (id) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('cart_items').delete().eq('id', id)
    }

    const updatedItems = get().items.filter(i => i.id !== id)
    set({ items: updatedItems })
    if (!user) saveLocalCart(updatedItems)
  },

  /* ---------- CLEAR ---------- */

  clearCart: async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id)
    } else {
      clearLocalCart()
    }

    set({ items: [] })
  },

  resetCart: () => {
    clearLocalCart()
    set({ items: [] })
  },

  /* ---------- SYNC LOGIN ---------- */

  syncCartWithSupabase: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('[syncCart] No user logged in, aborting.')
      return
    }

    const localItems = loadLocalCart() ?? []
    console.log('[syncCart] Local items loaded:', localItems)

    // Converteix quantity a número i filtra zeros
    const sanitizedLocalItems = localItems
      .map(item => ({ ...item, quantity: Number(item.quantity || 0) }))
      .filter(item => item.quantity > 0)

    console.log('[syncCart] Sanitized local items:', sanitizedLocalItems)

    const { data: remoteItems, error } = await supabase
      .from('cart_items')
      .select('id, product_id, variant_size, quantity')
      .eq('user_id', user.id)

    if (error) {
      console.error('[syncCart] Error loading remote cart:', error)
      return
    }
    console.log('[syncCart] Remote items loaded:', remoteItems)

    const mergedMap = new Map<string, { quantity: number; id?: string }>()

    // 1️⃣ Afegim remote items
    for (const item of remoteItems ?? []) {
      const key = `${item.product_id}_${item.variant_size}`
      mergedMap.set(key, { quantity: item.quantity, id: item.id })
    }
    console.log('[syncCart] After adding remote items:', Array.from(mergedMap.entries()))

    // 2️⃣ Afegim local items sumant quantitats
    for (const item of sanitizedLocalItems) {
      const key = `${item.product_id}_${item.variant_size}`
      if (mergedMap.has(key)) {
        mergedMap.get(key)!.quantity += item.quantity
      } else {
        mergedMap.set(key, { quantity: item.quantity })
      }
    }
    console.log('[syncCart] After merging local items:', Array.from(mergedMap.entries()))

    // 3️⃣ Prepara array per upsert
    const upsertItems = Array.from(mergedMap.entries()).map(([key, val]) => {
      const [product_id, variant_size] = key.split('_')
      return { user_id: user.id, product_id, variant_size, quantity: val.quantity }
    })
    console.log('[syncCart] Items to upsert:', upsertItems)

    // 4️⃣ Upsert amb onConflict correcte
    const { error: upsertError, data: upserted } = await supabase
      .from('cart_items')
      .upsert(upsertItems, { onConflict: 'user_id,product_id,variant_size' })
      .select() // 👈 per veure què ha estat upserted

    if (upsertError) {
      console.error('[syncCart] Error syncing cart', upsertError)
      return
    }
    console.log('[syncCart] Upserted items:', upserted)

    // 5️⃣ Neteja local i recarrega
    clearLocalCart()
    await get().loadCart()
    console.log('[syncCart] Sync complete, local cart cleared.')
  },

  /* ---------- STOCK ---------- */

  fetchStockForItems: async () => {
    const stockMap: Record<string, number> = {}

    for (const item of get().items) {
      const { data } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('product_id', item.product_id)
        .eq('size', item.variant_size)
        .single()

      stockMap[`${item.product_id}_${item.variant_size}`] = data?.stock ?? 0
    }

    return stockMap
  },
}))
