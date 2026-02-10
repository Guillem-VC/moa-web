'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'

export default function SuccessClient() {
  const resetCart = useCartStore((state) => state.resetCart)
  const loadCart = useCartStore((state) => state.loadCart)

  const searchParams = useSearchParams()
  const router = useRouter()

  const [valid, setValid] = useState(false)

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent')

    if (!paymentIntent) {
      router.replace('/')
      return
    }

    const run = async () => {
      const res = await fetch(
        `/api/checkout/validate-payment-intent?payment_intent=${paymentIntent}`
      )

      if (!res.ok) {
        router.replace('/')
        return
      }

      setValid(true)

      setTimeout(() => resetCart(), 1000)

      let tries = 0
      const interval = setInterval(() => {
        loadCart()
        tries++
        if (tries >= 4) clearInterval(interval)
      }, 1500)

      return () => clearInterval(interval)
    }

    run()
  }, [searchParams, router, resetCart, loadCart])

  // giff
  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Validating payment...
      </div>
    )
  }

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
            href="user/orders"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            View orders
          </Link>
        </div>
      </div>
    </div>
  )
}
