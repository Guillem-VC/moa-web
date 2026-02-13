import { Suspense } from 'react'
import CheckoutPaymentClient from './CheckoutPaymentClient'

export default function CheckoutPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading payment...</div>}>
      <CheckoutPaymentClient />
    </Suspense>
  )
}
