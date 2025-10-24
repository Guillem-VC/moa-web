'use client'

import { useEffect, useState } from 'react'
import { useCartStore, AddCartItem } from '@/store/cartStore'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'


export default function CartPage() {
  const { items, loadCart, removeFromCart, clearCart } = useCartStore()
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleCheckout = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // 🧩 Guarda el carrito local abans d’anar a login
      localStorage.setItem('guest_cart', JSON.stringify(items))
      router.push('/login')
      return
    }

    // 🔸 Si hi ha usuari, mirem si hi ha carrito de convidat
    const guestCart = localStorage.getItem('guest_cart')
    if (guestCart) {
      const guestItems: AddCartItem[] = JSON.parse(guestCart)

      // 🔸 Primer fusionem: comprovem si ja existeixen al Supabase
      for (const item of guestItems) {
        await useCartStore.getState().addToCart(item)
      }

      // 🔸 Eliminem el carrito de convidat
      localStorage.removeItem('guest_cart')
    }

    // 🔹 Tornem a carregar el carrito (ja sincronitzat)
    await useCartStore.getState().loadCart()

    alert('Compra iniciada!')
  }

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true)
      await loadCart()
      setLoading(false)
    }
    fetchCart()
  }, [loadCart])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (loading)
    return (
      <div className="text-center mt-24 text-gray-600">Carregant el carrito...</div>
    )

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fons */}
      <div className="absolute inset-0">
        <img
          src="https://sopotey.com/blog/wp-content/uploads/2024/04/ropa-de-marca-original.jpg"
          className="w-full h-full object-cover opacity-50 blur-md"
          alt="Fons"
        />
        <div className="absolute inset-0 bg-white/40"></div>
      </div>

      {/* Caixa central */}
      <div className="relative z-10 w-full max-w-3xl p-8 bg-white/80 backdrop-blur-md shadow-lg rounded-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">El teu carrito</h1>

        {items.length === 0 && (
          <p className="text-center text-gray-600 mt-6">El teu carrito és buit 🛒</p>
        )}

        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between bg-white p-4 rounded-xl shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-gray-500 text-sm">Talla: {item.variant_size}</p>
                  <p className="text-rose-700 font-medium">
                    {item.price} € x {item.quantity} = {(item.price * item.quantity).toFixed(2)} €
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-sm text-rose-600 hover:underline"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>

        {items.length > 0 && (
          <div className="mt-8 text-right">
            <p className="text-xl font-semibold text-gray-800">
              Total: <span className="text-rose-700">{total.toFixed(2)} €</span>
            </p>
            <button
              onClick={handleCheckout}
              className="mt-4 w-full md:w-auto bg-rose-600 text-white px-6 py-3 rounded-full hover:bg-rose-700 transition"
            >
              Finalitzar compra 💳
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
