'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '../ClientLayout'

export default function UserPage() {
  const user = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user !== undefined) setLoading(false)
    if (user === null) router.push('/cart')
  }, [user, router])

  if (loading) return <div>Carregant sessió...</div>
  if (!user) return null

  return (
    <div>
      <h1>Benvingut {user.email}</h1>
    </div>
  )
}
