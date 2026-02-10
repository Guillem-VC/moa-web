'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { supabase } from '@/lib/supabaseClient'

import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

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

function CheckoutForm({
  shipping,
  setShipping,
  clientSecret,
}: {
  shipping: Shipping
  setShipping: (s: Shipping) => void
  clientSecret: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { items, clearCart } = useCartStore()

  const [loading, setLoading] = useState(false)

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])

  const shippingCost = total >= 80 ? 0 : 5.99
  const finalTotal = total + shippingCost

  const requiredFields: (keyof Shipping)[] = [
    'email',
    'country',
    'firstName',
    'lastName',
    'address1',
    'postalCode',
    'city',
    'phone',
  ]

  const isShippingValid = requiredFields.every((f) => shipping[f].trim() !== '')

  const handlePay = async () => {
    if (!stripe || !elements) return
    if (!isShippingValid) return alert('Completa tots els camps obligatoris.')

    setLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success?payment_intent={PAYMENT_INTENT_ID}`,
      },
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    clearCart()
    setLoading(false)
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1px_420px] gap-12 items-start">
      {/* LEFT FORM */}
      <div className="space-y-10">
        {/* EXPRESS */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Express checkout
          </h2>

          <div className="flex gap-3">
            <button className="w-full rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Shop Pay
            </button>

            <button className="w-full rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Google Pay
            </button>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>
        </div>

        {/* CONTACT */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Contact</h2>

          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
            placeholder="Email"
            value={shipping.email}
            onChange={(e) =>
              setShipping({ ...shipping, email: e.target.value })
            }
          />
        </div>

        {/* DELIVERY */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Delivery</h2>

          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
            value={shipping.country}
            onChange={(e) =>
              setShipping({ ...shipping, country: e.target.value })
            }
          >
            <option value="">Country/Region</option>
            <option value="ES">Spain</option>
            <option value="FR">France</option>
            <option value="PT">Portugal</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
              placeholder="First name"
              value={shipping.firstName}
              onChange={(e) =>
                setShipping({ ...shipping, firstName: e.target.value })
              }
            />
            <input
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
              placeholder="Last name"
              value={shipping.lastName}
              onChange={(e) =>
                setShipping({ ...shipping, lastName: e.target.value })
              }
            />
          </div>

          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
            placeholder="Company (optional)"
            value={shipping.company}
            onChange={(e) =>
              setShipping({ ...shipping, company: e.target.value })
            }
          />

          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
            placeholder="Address"
            value={shipping.address1}
            onChange={(e) =>
              setShipping({ ...shipping, address1: e.target.value })
            }
          />

          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
            placeholder="Apartment, suite, etc."
            value={shipping.address2}
            onChange={(e) =>
              setShipping({ ...shipping, address2: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
              placeholder="Postal code"
              value={shipping.postalCode}
              onChange={(e) =>
                setShipping({ ...shipping, postalCode: e.target.value })
              }
            />
            <input
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
              placeholder="City"
              value={shipping.city}
              onChange={(e) =>
                setShipping({ ...shipping, city: e.target.value })
              }
            />
          </div>

          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
            placeholder="Phone"
            value={shipping.phone}
            onChange={(e) =>
              setShipping({ ...shipping, phone: e.target.value })
            }
          />
        </div>

        {/* PAYMENT */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment</h2>

          <div className="border border-gray-300 rounded-lg p-4">
            <PaymentElement />
          </div>
        </div>

        <button
          disabled={!isShippingValid || loading}
          onClick={handlePay}
          className={`w-full rounded-lg py-4 font-semibold text-white transition ${
            !isShippingValid || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-black/90'
          }`}
        >
          {loading ? 'Processing...' : `Pay now · €${finalTotal.toFixed(2)}`}
        </button>
      </div>

      {/* DIVIDER */}
      <div className="hidden lg:block bg-gray-200 w-px h-full" />

      {/* RIGHT SUMMARY */}
      <div className="space-y-6">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3">
              <div className="flex gap-3">
                <img
                  src={item.image_url}
                  className="w-14 h-14 rounded-md object-cover border"
                  alt={item.name}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.variant_size} · x{item.quantity}
                  </p>
                </div>
              </div>

              <p className="text-sm font-semibold text-gray-900">
                €{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">€{total.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shippingCost === 0 ? 'Free' : '€5.99'}
            </span>
          </div>

          <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-semibold">
            <span>Total</span>
            <span>€{finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items } = useCartStore()

  const [shipping, setShipping] = useState<Shipping>({
    email: '',
    country: '',
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    postalCode: '',
    city: '',
    province: '',
    phone: '',
  })

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session

      if (!session) {
        router.push('/signin')
        return
      }

      if (items.length === 0) {
        router.push('/cart')
        return
      }

      // Create PaymentIntent in backend
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product_id,
            variant_size: i.variant_size,
            quantity: i.quantity,
          })),
          shipping,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        alert(json?.error || 'Error iniciant checkout')
        return
      }

      setClientSecret(json.clientSecret)
      setLoading(false)
    }

    init()
  }, [router, items])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading checkout...
      </div>
    )
  }

  if (!clientSecret) return null

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-24">
          <CheckoutForm
            shipping={shipping}
            setShipping={setShipping}
            clientSecret={clientSecret}
          />
        </div>
      </div>
    </Elements>
  )
}