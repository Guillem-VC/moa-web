'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { supabase } from '@/lib/supabaseClient'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type Shipping = {
  email: string
  country: string
  firstName: string
  lastName: string
  company: string
  address1: string
  address2: string
  postalCode: string
  city: string
  province: string
  phone: string
}

function CheckoutProgress({ step }: { step: 1 | 2 | 3 }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get('sessionId')

  const steps = [
    { id: 1, label: 'Datos de envío', href: `/checkout/shipping` },
    { id: 2, label: 'Metodo de Pago', href: `/checkout/payment${sessionId ? `?sessionId=${sessionId}` : ''}` },
    { id: 3, label: 'Resumen', href: `/checkout/summary${sessionId ? `?sessionId=${sessionId}` : ''}` },
  ] as const

  return (
    <div className="flex items-center justify-between gap-4 mb-10">
      {steps.map((s, index) => {
        const isActive = step === s.id
        const isCompleted = step > s.id
        const isClickable = step > s.id

        return (
          <div key={s.id} className="flex items-center flex-1 gap-3">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => router.push(s.href)}
              className={`w-9 h-9 flex items-center justify-center rounded-full border text-sm font-semibold transition
                ${
                  isCompleted
                    ? 'bg-black text-white border-black hover:opacity-80 cursor-pointer'
                    : isActive
                    ? 'bg-white text-black border-black cursor-default'
                    : 'bg-white text-gray-400 border-gray-300 cursor-default'
                }
              `}
            >
              {s.id}
            </button>

            <span className={`text-sm font-semibold ${isActive ? 'text-black' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
              {s.label}
            </span>

            {index !== steps.length - 1 && (
              <div className="flex-1 h-px border-t border-dashed border-gray-300 mx-2" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CheckoutPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items } = useCartStore()
  const sessionId = searchParams.get('sessionId')

  const [loading, setLoading] = useState(true)
  const [shipping, setShipping] = useState<Shipping | null>(null)
  const [finalTotal, setFinalTotal] = useState<number>(0)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    const sessionIdParam = searchParams.get('sessionId')
    if (!sessionIdParam) return router.push('/')

    const loadSessionAndIntent = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const token = data.session?.access_token
        if (!token) return router.push('/login')

        // 1️⃣ Obtenir sessió
        const res = await fetch(`/api/checkout/get-session?sessionId=${sessionIdParam}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
        const dataRes = await res.json()
        if (!res.ok) return router.push('/checkout')

        setShipping(dataRes.shipping)
        setFinalTotal(dataRes.totalAmount)

        // 2️⃣ Crear PaymentIntent i obtenir clientSecret
        const paymentRes = await fetch('/api/checkout/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId: sessionIdParam,
            totalAmount: dataRes.totalAmount,
          }),
        })

        const paymentData = await paymentRes.json()
        if (!paymentRes.ok) throw new Error(paymentData.error)
        setClientSecret(paymentData.clientSecret)
      } catch (err) {
        console.error(err)
        router.push('/checkout')
      } finally {
        setLoading(false)
      }
    }

    loadSessionAndIntent()
  }, [searchParams, router])

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])
  const shippingCost = total >= 80 ? 0 : 5.99

  if (!sessionId || !clientSecret) return null
  if (items.length === 0) return <div className="min-h-screen flex items-center justify-center text-gray-600">Your cart is empty.</div>
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading payment...</div>
  if (!shipping) return <div className="min-h-screen flex items-center justify-center text-gray-600">Could not load checkout session.</div>

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-24">
        <CheckoutProgress step={2} />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_420px] gap-12 items-start">
          {/* RIGHT SUMMARY */}
          <div className="space-y-6 order-first lg:order-last">
            <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>

            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between gap-3">
                  <div className="flex gap-3">
                    <img src={item.image_url} className="w-14 h-14 rounded-md object-cover border" alt={item.name} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.variant_size} · x{item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">€{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* TOTALS */}
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">€{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{shippingCost === 0 ? 'Free' : '€5.99'}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-semibold">
                <span>Total</span>
                <span>€{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* SHIPPING INFO */}
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <p className="text-sm font-semibold text-gray-900">Shipping info</p>
              <p className="text-sm text-gray-600">{shipping.firstName} {shipping.lastName}</p>
              <p className="text-sm text-gray-600">{shipping.address1} {shipping.address2}</p>
              <p className="text-sm text-gray-600">{shipping.postalCode}, {shipping.city}</p>
              <p className="text-sm text-gray-600">{shipping.country}</p>
            </div>
          </div>    
          
          {/* DIVIDER */}
          <div className="hidden lg:block bg-gray-200 w-px h-full" />

          {/* LEFT - PAYMENT */}
          <div className="space-y-10 order-last lg:order-first">
            <h2 className="text-lg font-semibold text-gray-900">Payment method</h2>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm finalTotal={finalTotal} shipping={shipping} />
            </Elements>
          </div>

          
        </div>

        <p className="text-xs text-gray-400 mt-12">By continuing, you agree to our terms and conditions.</p>
      </div>
    </div>
  )
}

function PaymentForm({ finalTotal, shipping }: { finalTotal: number; shipping: Shipping }) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
        shipping: {
          name: `${shipping.firstName} ${shipping.lastName}`,
          address: {
            line1: shipping.address1,
            line2: shipping.address2,
            city: shipping.city,
            postal_code: shipping.postalCode,
            country: shipping.country,
          },
        },
      },
    })

    if (error) console.error(error)
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-6 space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe}
        className="w-full rounded-lg py-4 font-semibold text-white bg-black"
      >
        Pay €{finalTotal.toFixed(2)}
      </button>
    </form>
  )
}
