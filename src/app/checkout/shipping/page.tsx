'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { supabase } from '@/lib/supabaseClient'

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

type Coupon = {
  id: string
  code: string
  type: 'percent' | 'fixed' | 'free_shipping'
  value: number
  active: boolean
  min_order: number
  expires_at: string | null
}

const getProvinceFromPostalCode = (postalCode: string) => {
  const prefix = postalCode.substring(0, 2)

  const provinces: Record<string, string> = {
    '01': 'Álava',
    '02': 'Albacete',
    '03': 'Alicante',
    '04': 'Almería',
    '05': 'Ávila',
    '06': 'Badajoz',
    '07': 'Islas Baleares',
    '08': 'Barcelona',
    '09': 'Burgos',
    '10': 'Cáceres',
    '11': 'Cádiz',
    '12': 'Castellón',
    '13': 'Ciudad Real',
    '14': 'Córdoba',
    '15': 'A Coruña',
    '16': 'Cuenca',
    '17': 'Girona',
    '18': 'Granada',
    '19': 'Guadalajara',
    '20': 'Gipuzkoa',
    '21': 'Huelva',
    '22': 'Huesca',
    '23': 'Jaén',
    '24': 'León',
    '25': 'Lleida',
    '26': 'La Rioja',
    '27': 'Lugo',
    '28': 'Madrid',
    '29': 'Málaga',
    '30': 'Murcia',
    '31': 'Navarra',
    '32': 'Ourense',
    '33': 'Asturias',
    '34': 'Palencia',
    '35': 'Las Palmas',
    '36': 'Pontevedra',
    '37': 'Salamanca',
    '38': 'Santa Cruz de Tenerife',
    '39': 'Cantabria',
    '40': 'Segovia',
    '41': 'Sevilla',
    '42': 'Soria',
    '43': 'Tarragona',
    '44': 'Teruel',
    '45': 'Toledo',
    '46': 'Valencia',
    '47': 'Valladolid',
    '48': 'Bizkaia',
    '49': 'Zamora',
    '50': 'Zaragoza',
    '51': 'Ceuta',
    '52': 'Melilla',
  }

  return provinces[prefix] || ''
}

const getAutonomousCommunityFromProvince = (province: string) => {
  const map: Record<string, string> = {
    'Álava': 'País Vasco',
    'Gipuzkoa': 'País Vasco',
    'Bizkaia': 'País Vasco',

    'Barcelona': 'Cataluña',
    'Girona': 'Cataluña',
    'Lleida': 'Cataluña',
    'Tarragona': 'Cataluña',

    'Madrid': 'Comunidad de Madrid',

    'Valencia': 'Comunidad Valenciana',
    'Alicante': 'Comunidad Valenciana',
    'Castellón': 'Comunidad Valenciana',

    'Sevilla': 'Andalucía',
    'Málaga': 'Andalucía',
    'Cádiz': 'Andalucía',
    'Granada': 'Andalucía',
    'Almería': 'Andalucía',
    'Córdoba': 'Andalucía',
    'Huelva': 'Andalucía',
    'Jaén': 'Andalucía',

    'Zaragoza': 'Aragón',
    'Huesca': 'Aragón',
    'Teruel': 'Aragón',

    'Asturias': 'Principado de Asturias',

    'Islas Baleares': 'Islas Baleares',

    'Las Palmas': 'Canarias',
    'Santa Cruz de Tenerife': 'Canarias',

    'Cantabria': 'Cantabria',

    'Ávila': 'Castilla y León',
    'Burgos': 'Castilla y León',
    'León': 'Castilla y León',
    'Palencia': 'Castilla y León',
    'Salamanca': 'Castilla y León',
    'Segovia': 'Castilla y León',
    'Soria': 'Castilla y León',
    'Valladolid': 'Castilla y León',
    'Zamora': 'Castilla y León',

    'Albacete': 'Castilla-La Mancha',
    'Ciudad Real': 'Castilla-La Mancha',
    'Cuenca': 'Castilla-La Mancha',
    'Guadalajara': 'Castilla-La Mancha',
    'Toledo': 'Castilla-La Mancha',

    'Badajoz': 'Extremadura',
    'Cáceres': 'Extremadura',

    'A Coruña': 'Galicia',
    'Lugo': 'Galicia',
    'Ourense': 'Galicia',
    'Pontevedra': 'Galicia',

    'Murcia': 'Región de Murcia',

    'Navarra': 'Navarra',

    'La Rioja': 'La Rioja',

    'Ceuta': 'Ceuta',
    'Melilla': 'Melilla',
  }

  return map[province] || ''
}

function CheckoutProgress({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { id: 1, label: 'Datos de envío' },
    { id: 2, label: 'Metodo de Pago' },
    { id: 3, label: 'Resumen' },
  ] as const

  return (
    <div className="flex items-center justify-between gap-4 mb-10">
      {steps.map((s, index) => {
        const isActive = step === s.id
        const isCompleted = step > s.id

        return (
          <div key={s.id} className="flex items-center flex-1 gap-3">
            <div
              className={`w-9 h-9 flex items-center justify-center rounded-full border text-sm font-semibold transition ${
                isCompleted
                  ? 'bg-black text-white border-black'
                  : isActive
                  ? 'border-black text-black'
                  : 'border-gray-300 text-gray-400'
              }`}
            >
              {s.id}
            </div>

            <span
              className={`text-sm font-semibold ${
                isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
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

export default function CheckoutShippingPage() {
  const router = useRouter()
  const { items } = useCartStore()

  const [shipping, setShipping] = useState<Shipping>({
    email: '',
    country: 'ES',
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

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState<string | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const [isContinuing, setIsContinuing] = useState(false)


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

  const isFieldInvalid = (field: keyof Shipping) => {
    return submitted && shipping[field].trim() === ''
  }

  const isShippingValid = requiredFields.every((f) => shipping[f].trim() !== '')


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
    }
    init()
  }, [router, items])

  useEffect(() => {
    const fetchPostalInfo = async () => {
      const postal = shipping.postalCode.trim()

      if (shipping.country !== 'ES') return
      if (!/^\d{5}$/.test(postal)) return

      try {
        const res = await fetch(`https://api.zippopotam.us/es/${postal}`)
        if (!res.ok) return

        const data = await res.json()
        const place = data.places?.[0]
        if (!place) return

        const city = place['place name'] || ''
        const provinceName = getProvinceFromPostalCode(postal) || ''
        const comunidad = getAutonomousCommunityFromProvince(provinceName)

        const fullProvince =
          provinceName && comunidad
            ? `${provinceName}, ${comunidad}`
            : provinceName

        setShipping((prev) => ({
          ...prev,
          city: prev.city || city,
          province: prev.province || fullProvince,
        }))
      } catch (err) {
        console.error('Error fetching postal code info:', err)
      }
    }

    fetchPostalInfo()
  }, [shipping.postalCode, shipping.country])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        const user = data.user

        if (!user) {
          setLoadingProfile(false)
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error || !profile) {
          setLoadingProfile(false)
          return
        }

        const fullName = profile.full_name ?? ''
        const parts = fullName.trim().split(' ')
        const firstName = parts.length > 0 ? parts[0] : ''
        const lastName = parts.length > 1 ? parts.slice(1).join(' ') : ''

        setShipping((prev) => ({
          ...prev,
          email: prev.email || profile.email || user.email || '',
          phone: prev.phone || profile.phone || '',
          country: profile.country || prev.country || 'ES',
          city: prev.city || profile.city || '',
          postalCode: prev.postalCode || profile.postal_code || '',
          address1: prev.address1 || profile.address || '',
          address2: prev.address2 || profile.additional_address_info || '',
          firstName: prev.firstName || firstName,
          lastName: prev.lastName || lastName,
        }))

        setLoadingProfile(false)
      } catch (err) {
        console.error('[CheckoutShipping] Error loading profile:', err)
        setLoadingProfile(false)
      }
    }

    loadProfile()
  }, [])

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])

  const shippingCost = total >= 80 ? 0 : 5.99

  const finalTotal = useMemo(() => {
    return total + shippingCost - discountAmount
  }, [total, shippingCost, discountAmount])

  const handleContinue = async () => {

    if (isContinuing) return

    setSubmitted(true)
    if (!isShippingValid) return
    setIsContinuing(true)

    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      if (!token) {
        setCouponError('You must be logged in to continue.')
        return
      }

      const shippingPayload = {
        name: `${shipping.firstName} ${shipping.lastName}`.trim(),
        email: shipping.email,
        line1: shipping.address1,
        line2: shipping.address2 || '',
        city: shipping.city,
        postal_code: shipping.postalCode,
        country: shipping.country,
        phone: shipping.phone,
      }

      const res = await fetch('/api/checkout/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shipping: shippingPayload }),
      })

      const dataRes = await res.json()

      if (!res.ok) {
        console.error('[CheckoutShipping] update-profile error:', dataRes)
        alert(dataRes.error || 'Failed to update profile')
        return
      }

      // ✅ Create checkout session
      const sessionRes = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping,
          items,
          totalAmount: finalTotal,
          currency: 'eur',
        }),
      })

      const sessionData = await sessionRes.json()

      if (!sessionRes.ok) {
        console.error('[CheckoutShipping] create-session error:', sessionData)
        alert(sessionData.error || 'Failed to create checkout session')
        return
      }

      // ✅ pass sessionId to payment page
      router.push(`/checkout/payment?sessionId=${sessionData.sessionId}`)
    } catch (err) {
      console.error('[CheckoutShipping] Unexpected error updating profile:', err)
      alert('Unexpected error saving shipping info')
    }
  }


  const handleApplyCoupon = async () => {
    setCouponError(null)
    const code = couponCode.trim().toUpperCase()

    if (!code) {
      setCouponError('Enter a coupon code.')
      return
    }

    setCouponLoading(true)

    try {
      // ✅ Crida a la teva API
      const res = await fetch('/api/checkout/coupon_intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          total, // total del carret actual
          shippingCost,
        }),
      })

      const data: { discountAmount: number; finalTotal: number; message?: string } = await res.json()

      if (!res.ok) {
        setCouponError(data.message || 'Invalid or expired coupon.')
        setDiscountAmount(0)
        setCouponApplied(null)
        return
      }

      if (data.discountAmount === 0) {
        setCouponError(data.message || 'Invalid or expired coupon.')
        setDiscountAmount(0)
        setCouponApplied(null)
        return
      }

      // Actualitzem l'estat amb el descompte que retorna l'API
      setDiscountAmount(data.discountAmount)
      setCouponApplied(code)
      setCouponCode('')
      setCouponError(null)
    } catch (err: any) {
      console.error(err)
      setCouponError(err.message || 'Unexpected error applying coupon.')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponApplied(null)
    setDiscountAmount(0)
    setCouponError(null)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Your cart is empty.
      </div>
    )
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your information...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-24">
        <CheckoutProgress step={1} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_420px] gap-12 items-start">
          {/* RIGHT SUMMARY */}
          <div className="space-y-6 order-first lg:order-last">
            <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>

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

            {/* COUPON */}
            <div className="border-t border-gray-200 pt-5 space-y-3">
              <p className="text-sm font-semibold text-gray-900">Discount code</p>

              {couponApplied && (
                <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{couponApplied}</p>
                    <p className="text-xs text-gray-500">Coupon applied</p>
                  </div>

                  <button
                    onClick={handleRemoveCoupon}
                    className="text-sm font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* ✅ Always show input so user can replace coupon */}
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                  placeholder={
                    couponApplied ? 'Enter new coupon to replace current' : 'Enter coupon'
                  }
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />

                <button
                  disabled={couponLoading}
                  onClick={handleApplyCoupon}
                  className={`px-4 py-3 rounded-lg text-white text-sm font-semibold transition ${
                    couponLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-black/90'
                  }`}
                >
                  {couponLoading ? 'Checking...' : couponApplied ? 'Replace' : 'Apply'}
                </button>
              </div>

              {couponError && (
                <p className="text-xs text-red-600 font-medium">{couponError}</p>
              )}
            </div>

            {/* TOTALS */}
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

              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -€{discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-semibold">
                <span>Total</span>
                <span>€{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          {/* DIVIDER */}
          <div className="hidden lg:block bg-gray-200 w-px h-full" />
          {/* LEFT FORM */}
          <div className="space-y-10 order-last lg:order-first">
            {/* CONTACT */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Contact</h2>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>

                <input
                  className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/30 ${
                    isFieldInvalid('email')
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Email"
                  value={shipping.email}
                  onChange={(e) =>
                    setShipping({ ...shipping, email: e.target.value })
                  }
                />

                {isFieldInvalid('email') && (
                  <p className="text-xs text-red-600 font-medium">
                    Email is required.
                  </p>
                )}
              </div>
            </div>

            {/* DELIVERY */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Delivery</h2>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Country/Region <span className="text-red-500">*</span>
                </label>

                <select
                  className={`w-full border rounded-lg px-4 py-3 text-sm ${
                    isFieldInvalid('country')
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  value={shipping.country}
                  onChange={(e) =>
                    setShipping({ ...shipping, country: e.target.value })
                  }
                >
                  <option value="">Select country</option>
                  <option value="ES">Spain</option>
                  <option value="FR">France</option>
                  <option value="PT">Portugal</option>
                </select>

                {isFieldInvalid('country') && (
                  <p className="text-xs text-red-600 font-medium">
                    Country is required.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    First name <span className="text-red-500">*</span>
                  </label>

                  <input
                    className={`w-full border rounded-lg px-4 py-3 text-sm ${
                      isFieldInvalid('firstName')
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="First name"
                    value={shipping.firstName}
                    onChange={(e) =>
                      setShipping({ ...shipping, firstName: e.target.value })
                    }
                  />

                  {isFieldInvalid('firstName') && (
                    <p className="text-xs text-red-600 font-medium">
                      First name is required.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Last name <span className="text-red-500">*</span>
                  </label>

                  <input
                    className={`w-full border rounded-lg px-4 py-3 text-sm ${
                      isFieldInvalid('lastName')
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Last name"
                    value={shipping.lastName}
                    onChange={(e) =>
                      setShipping({ ...shipping, lastName: e.target.value })
                    }
                  />

                  {isFieldInvalid('lastName') && (
                    <p className="text-xs text-red-600 font-medium">
                      Last name is required.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Company <span className="text-gray-400">(optional)</span>
                </label>

                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
                  placeholder="Company"
                  value={shipping.company}
                  onChange={(e) =>
                    setShipping({ ...shipping, company: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Dirección y Número <span className="text-red-500">*</span>
                </label>

                <input
                  className={`w-full border rounded-lg px-4 py-3 text-sm ${
                    isFieldInvalid('address1')
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Ej: Calle MOA, 1"
                  value={shipping.address1}
                  onChange={(e) =>
                    setShipping({ ...shipping, address1: e.target.value })
                  }
                />

                {isFieldInvalid('address1') && (
                  <p className="text-xs text-red-600 font-medium">
                    Dirección requerida.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Información adicional{' '}
                  <span className="text-gray-400">(optional)</span>
                </label>

                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
                  placeholder="Piso-Puerta"
                  value={shipping.address2}
                  onChange={(e) =>
                    setShipping({ ...shipping, address2: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Postal code <span className="text-red-500">*</span>
                  </label>

                  <input
                    className={`w-full border rounded-lg px-4 py-3 text-sm ${
                      isFieldInvalid('postalCode')
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Postal code"
                    value={shipping.postalCode}
                    onChange={(e) =>
                      setShipping({ ...shipping, postalCode: e.target.value })
                    }
                  />

                  {isFieldInvalid('postalCode') && (
                    <p className="text-xs text-red-600 font-medium">
                      Postal code is required.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>

                  <input
                    className={`w-full border rounded-lg px-4 py-3 text-sm ${
                      isFieldInvalid('city')
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="City"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({ ...shipping, city: e.target.value })
                    }
                  />

                  {isFieldInvalid('city') && (
                    <p className="text-xs text-red-600 font-medium">
                      City is required.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Province / Comunidad Autónoma{' '}
                  <span className="text-gray-400">(auto)</span>
                </label>

                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-50"
                  placeholder="Auto detected from postal code"
                  value={shipping.province}
                  readOnly
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </label>

                <input
                  className={`w-full border rounded-lg px-4 py-3 text-sm ${
                    isFieldInvalid('phone')
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Phone"
                  value={shipping.phone}
                  onChange={(e) =>
                    setShipping({ ...shipping, phone: e.target.value })
                  }
                />

                {isFieldInvalid('phone') && (
                  <p className="text-xs text-red-600 font-medium">
                    Phone is required.
                  </p>
                )}
              </div>
            </div>

            <button
              disabled={isContinuing}
              onClick={handleContinue}
              className={`w-full rounded-lg py-4 font-semibold text-white transition ${
                isContinuing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : !isShippingValid && submitted
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-black hover:bg-black/90'
              }`}
            >
              {isContinuing ? 'Processing...' : 'Continue to payment'}
            </button>


            {!isShippingValid && submitted && (
              <p className="text-sm text-red-600 font-medium">
                Please fill all required fields before continuing.
              </p>
            )}
          </div>
          
        </div>

        <p className="text-xs text-gray-400 mt-12">
          By continuing, you agree to our terms and conditions.
        </p>
      </div>
    </div>
  )
}
