'use client'

import { Dispatch, SetStateAction } from 'react'

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

type Props = {
  shipping: Shipping
  setShipping: Dispatch<SetStateAction<Shipping>>
}

export default function ShippingForm({ shipping, setShipping }: Props) {
  const handleChange = (field: keyof Shipping, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form className="space-y-4">
      <input type="text" placeholder="First Name" value={shipping.firstName} onChange={(e) => handleChange('firstName', e.target.value)} className="border p-2 w-full" />
      <input type="text" placeholder="Last Name" value={shipping.lastName} onChange={(e) => handleChange('lastName', e.target.value)} className="border p-2 w-full" />
      <input type="email" placeholder="Email" value={shipping.email} onChange={(e) => handleChange('email', e.target.value)} className="border p-2 w-full" />
      <input type="text" placeholder="Address 1" value={shipping.address1} onChange={(e) => handleChange('address1', e.target.value)} className="border p-2 w-full" />
      <input type="text" placeholder="Address 2" value={shipping.address2} onChange={(e) => handleChange('address2', e.target.value)} className="border p-2 w-full" />
      <input type="text" placeholder="City" value={shipping.city} onChange={(e) => handleChange('city', e.target.value)} className="border p-2 w-full" />
      <input type="text" placeholder="Postal Code" value={shipping.postalCode} onChange={(e) => handleChange('postalCode', e.target.value)} className="border p-2 w-full" />
      <input type="text" placeholder="Phone" value={shipping.phone} onChange={(e) => handleChange('phone', e.target.value)} className="border p-2 w-full" />
      <input type="text" placeholder="Country" value={shipping.country} onChange={(e) => handleChange('country', e.target.value)} className="border p-2 w-full" />
      <input type="text" placeholder="Province" value={shipping.province} onChange={(e) => handleChange('province', e.target.value)} className="border p-2 w-full" />
    </form>
  )
}
