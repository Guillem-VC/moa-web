'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectStatus = searchParams.get('redirect_status')
  const paymentIntent = searchParams.get('payment_intent')

  useEffect(() => {
    if (!redirectStatus) return

    // Si no és succeeded, el portem a error o checkout
    if (redirectStatus !== 'succeeded') {
      router.push('/checkout')
    }
  }, [redirectStatus, router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Payment successful 🎉
        </h1>

        <p className="text-gray-600 text-sm">
          Thank you for your purchase. Your payment has been confirmed.
        </p>

        {paymentIntent && (
          <p className="text-xs text-gray-400 break-all">
            PaymentIntent: {paymentIntent}
          </p>
        )}

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
