'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore' // <-- import correcte del store

// Indica a Next.js que aquesta pàgina sempre és renderitzada al client
export const dynamic = 'force-dynamic'

export default function SuccessPage() {
  const router = useRouter()
  const resetCart = useCartStore((state) => state.resetCart) // <-- agafem la funció del store

  // Netejar el carrito quan la pàgina es carrega
  useEffect(() => {
    resetCart()
  }, [resetCart])

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
