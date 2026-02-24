'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2, ShoppingBag, Trash2, Minus, Plus, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { items, loadCart, removeFromCart, addToCart, clearCart } = useCartStore()
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await loadCart()
      setLoading(false)
    }
    init()
  }, [loadCart])

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])

  const shipping = subtotal > 80 ? 0 : 4.99
  const total = subtotal + shipping

  const handleCheckout = async () => {
    setCheckoutLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      setCheckoutLoading(false)
      return
    }

    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-stone-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-28 pb-20 text-stone-900">
      <div className="max-w-7xl mx-auto px-6">

        <h1 className="text-3xl font-bold mb-10">Carrito</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-stone-400" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Tu carrito está vacío</h2>
            <p className="text-stone-500 mb-6">
              Parece que no has añadido nada aún.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition"
            >
              Continuar comprando
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-6 flex gap-6 border border-stone-200"
                >
                  <div className="w-24 h-24 bg-stone-100 rounded-lg overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-stone-500 mt-1">
                        Talla: {item.variant_size}
                      </p>
                      {/* Preu per unitat */}
                      <p className="text-sm text-stone-500 mt-1">
                        Precio unitario: <span className="font-medium">{item.price.toFixed(2)} €</span>
                      </p>
                      
                      {/* Subtotal */}
                      <p className="text-lg font-semibold mt-2">
                        Subtotal: <span>{(item.price * item.quantity).toFixed(2)} €</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => removeFromCart(item.id, 1)}
                          className="p-2 hover:bg-stone-50 transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="w-10 text-center font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => addToCart({ ...item, quantity: 1 })}
                          className="p-2 hover:bg-stone-50 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.quantity)}
                        className="p-2 text-stone-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-sm text-stone-500 hover:text-stone-900 transition"
              >
                Limpiar carrito
              </button>
            </div>

            {/* RIGHT COLUMN */}
            <div>
              <div className="bg-white rounded-xl p-6 border border-stone-200 sticky top-28">
                <h2 className="text-lg font-semibold mb-6">Resumen</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Subtotal</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-600">Envío</span>
                    <span>
                      {shipping === 0 ? 'FREE' : `${shipping.toFixed(2)} €`}
                    </span>
                  </div>

                  <div className="border-t pt-3 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>

                {subtotal < 80 && (
                  <p className="text-sm text-stone-500 mt-4 bg-stone-50 p-3 rounded-lg">
                    Añadir {(80 - subtotal).toFixed(2)} € más per envío gratuito.
                  </p>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full mt-6 h-12 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Checkout
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full mt-3 text-sm text-stone-600 hover:text-stone-900 transition"
                >
                  Continuar comprando
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}