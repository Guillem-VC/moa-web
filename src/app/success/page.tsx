'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'

export const dynamic = 'force-dynamic'

export default function SuccessPage() {
  const resetCart = useCartStore((state) => state.resetCart)
  const loadCart = useCartStore((state) => state.loadCart)

  useEffect(() => {
    // ✅ 1) Buidem immediatament el carrito en frontend (UX instantània)
    resetCart()

    // ✅ 2) Recarreguem des de Supabase uns cops (Stripe webhook pot trigar)
    let tries = 0

    const interval = setInterval(() => {
      loadCart()
      tries++

      if (tries >= 3) clearInterval(interval)
    }, 1500)

    return () => clearInterval(interval)
  }, [resetCart, loadCart])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Payment successful 🎉
        </h1>

        <p className="text-gray-600 text-sm">
          Thank you for your purchase. Your payment has been confirmed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="rounded-lg bg-black px-6 py-3 text-white font-semibold hover:bg-black/90 transition"
          >
            Back to home
          </Link>

          <Link
            href="/orders"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            View orders
          </Link>
        </div>
      </div>
    </div>
  )
}
