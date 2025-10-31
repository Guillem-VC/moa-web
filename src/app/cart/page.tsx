'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'

export default function CartPage() {
  const { items, loadCart, removeFromCart, updateQuantity, fetchStockForItems } = useCartStore()
  const [loading, setLoading] = useState(true)
  const [stockMap, setStockMap] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await loadCart()
      const stock = await fetchStockForItems()
      setStockMap(stock)
      setLoading(false)
    }
    fetchData()
  }, [loadCart, fetchStockForItems])

  const handleIncrease = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return
    const key = item.product_id + '_' + item.variant_size
    const maxStock = stockMap[key] || 0
    if (item.quantity < maxStock) {
      await updateQuantity(item.id, item.quantity + 1)
    } else {
      alert('Has arribat al límit d’stock disponible per aquesta talla.')
    }
  }

  const handleDecrease = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (item && item.quantity > 1) {
      await updateQuantity(item.id, item.quantity - 1)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <img
          src="/gos.gif"
          alt="Carregant..."
          className="w-24 h-auto"
        />
      </div>
    )

  return (
    <div className="absolute inset-0">
      {/* FONS */}
      <div className="absolute inset-0">
        <img
          src="https://sopotey.com/blog/wp-content/uploads/2024/04/ropa-de-marca-original.jpg"
          className="w-full h-full object-cover opacity-50 blur-md"
          alt="Fons"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-rose-100 via-rose-200 to-white/70"></div>
      </div>

      {/* Caixa central */}
      <div className="relative z-10 max-w-3xl mx-auto p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg mt-24">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">El teu carrito</h1>

        {items.length === 0 && (
          <p className="text-center text-gray-600 mt-6">Carrito buit 🛒</p>
        )}

        <ul className="space-y-4">
          {items.map((item) => {
            const key = item.product_id + '_' + item.variant_size
            const maxStock = stockMap[key] || 0

            return (
              <li key={item.id} className="flex items-center justify-between bg-white/80 backdrop-blur-lg p-4 rounded-2xl shadow hover:shadow-xl transition transform hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <img src={item.image_url} className="w-20 h-20 object-cover rounded-lg" alt={item.name} />
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Talla: {item.variant_size}</p>
                    <p className="text-rose-700 font-medium">
                      {item.price} € x {item.quantity} = {(item.price * item.quantity).toFixed(2)} €
                    </p>

                    {/* Controls de quantitat */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleDecrease(item.id)}
                        className="bg-rose-300 w-7 h-7 rounded-full disabled:opacity-100"
                        disabled={item.quantity <= 1}
                      >
                        –
                      </button>
                      <span className="text-black font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleIncrease(item.id)}
                        className="bg-rose-600 w-7 h-7 rounded-full disabled:opacity-0"
                        disabled={item.quantity >= maxStock}
                      >
                        +
                      </button>
                      <span className="text-xs text-gray-500 ml-2">Stock: {maxStock}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm text-rose-600 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            )
          })}
        </ul>

        {items.length > 0 && (
          <div className="mt-8 text-right">
            <p className="text-xl font-semibold text-gray-800">
              Total: <span className="text-rose-700">{items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)} €</span>
            </p>
            <button className="mt-4 w-full md:w-auto bg-rose-600 text-white px-6 py-3 rounded-full hover:bg-rose-700 transition">
              Finalitzar compra 💳
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
