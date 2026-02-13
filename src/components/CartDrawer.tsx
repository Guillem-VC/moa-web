'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useCartStore } from '@/store/cartStore'

export default function CartDrawer() {
  const cartOpen = useUIStore((s) => s.cartOpen)
  const closeCart = useUIStore((s) => s.closeCart)

  const items = useCartStore((s) => s.items)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!cartOpen) return null

  return (
    <div className="fixed inset-0 z-[999] flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white shadow-xl p-6 flex flex-col animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Tu carrito ({items.length})
          </h2>

          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-gray-500 text-sm">El carrito está vacío.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b pb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Cantidad: {item.quantity}
                  </p>
                </div>

                <div className="text-sm font-semibold text-gray-900">
                  {(item.price * item.quantity).toFixed(2)}€
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between text-gray-900 font-semibold">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)}€</span>
          </div>

          <Link
            href="/cart"
            onClick={closeCart}
            className="block w-full text-center border border-gray-300 rounded-lg py-3 font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Ver carrito
          </Link>

          <Link
            href="/checkout/shipping"
            onClick={closeCart}
            className="block w-full text-center bg-black text-white rounded-lg py-3 font-semibold hover:bg-black/90 transition"
          >
            Checkout
          </Link>
        </div>
      </div>

      {/* Animació */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>
    </div>
  )
}
