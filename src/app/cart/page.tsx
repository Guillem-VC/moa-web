'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2, ShoppingBag, Trash2, Minus, Plus, Truck, ShieldCheck } from 'lucide-react'
import { FaCcVisa, FaCcMastercard, FaPaypal, FaApplePay } from 'react-icons/fa'

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

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])

  const handleCheckout = async () => {
    setCheckoutLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.push('/signin')
      setCheckoutLoading(false)
      return
    }

    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 via-white to-rose-100">
        <div className="flex flex-col items-center gap-4">
          <img src="/gos.gif" className="w-24 opacity-80" />
          <p className="text-gray-600 text-sm">Cargando carrito...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-14">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-rose-600" />
              Tu carrito
            </h1>
            <p className="text-gray-600 mt-2">
              Revisa tu pedido antes de finalizar la compra.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-gray-600 hover:text-rose-600 transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Vaciar carrito
            </button>
          )}
        </div>

        {/* EMPTY STATE */}
        {items.length === 0 && (
          <div className="bg-white/80 backdrop-blur-xl border border-black/10 rounded-3xl shadow-lg p-10 text-center">
            <p className="text-lg font-medium text-gray-900">Tu carrito está vacío 🛒</p>
            <p className="text-gray-600 mt-2">Descubre nuestra colección y añade productos.</p>

            <button
              onClick={() => router.push('/')}
              className="mt-6 px-8 py-3 rounded-full bg-rose-600 text-white font-medium hover:bg-rose-700 transition"
            >
              Ver productos
            </button>
          </div>
        )}

        {/* MAIN GRID */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* LEFT: ITEMS */}
            <div className="lg:col-span-2 space-y-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/80 backdrop-blur-xl border border-black/10 rounded-3xl shadow-md p-5 flex gap-5"
                >
                  {/* IMG */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-lg leading-tight">
                          {item.name}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          Talla: <span className="font-medium">{item.variant_size}</span>
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          Precio: <span className="font-medium">{item.price.toFixed(2)} €</span>
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.quantity)}
                        className="text-gray-500 hover:text-rose-600 transition p-2 rounded-full hover:bg-rose-50"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* FOOT */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* QTY */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-50 border border-black/10 rounded-full overflow-hidden">
                          <button
                            onClick={() => removeFromCart(item.id, 1)}
                            className="px-3 py-2 hover:bg-gray-100 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <span className="px-4 font-medium text-gray-900">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => addToCart({ ...item, quantity: 1 })}
                            className="px-3 py-2 hover:bg-gray-100 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <span className="text-sm text-gray-600">
                          Subtotal:{' '}
                          <span className="font-semibold text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} €
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: SUMMARY */}
            <div className="bg-white/80 backdrop-blur-xl border border-black/10 rounded-3xl shadow-lg p-7 h-fit sticky top-28">
              <h2 className="text-xl font-semibold text-gray-900">Resumen</h2>

              <div className="mt-5 space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{total.toFixed(2)} €</span>
                </div>
                <div className="border-t border-black/10 pt-4 flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-rose-600">
                    {total.toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* CHECKOUT BUTTON */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className={`mt-6 w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition
                  ${
                    checkoutLoading
                      ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                      : 'bg-gradient-to-r from-rose-600 to-pink-500 text-white hover:opacity-90'
                  }`}
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Finalizar compra'
                )}
              </button>

              {/* PAYMENT ICONS */}
              <div className="mt-6">
                <p className="text-xs text-gray-500 mb-2">Métodos de pago</p>
                <div className="flex items-center gap-3 text-2xl text-gray-500 opacity-80">
                  <FaCcVisa />
                  <FaCcMastercard />
                  <FaPaypal />
                  <FaApplePay />
                </div>
              </div>

              {/* STRIPE STYLE INFO */}
              <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-2 bg-gray-50 border border-black/10 rounded-2xl p-4">
                  <Truck className="w-5 h-5 text-gray-700" />
                  <span>Envío en 24/48h</span>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 border border-black/10 rounded-2xl p-4">
                  <ShieldCheck className="w-5 h-5 text-gray-700" />
                  <span>Pago seguro cifrado</span>
                </div>
              </div>

              {/* NOTE */}
              <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                Al finalizar la compra aceptas nuestras condiciones y política de devolución.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
