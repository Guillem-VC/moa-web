'use client'

import { useUser } from '@/app/layout'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function UserPage() {
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    // IMPORTANT: NOMÉS redirigir quan user === null
    if (user === null) {
      router.push('/login')
    }
  }, [user, router])

  // IMPORTANT: Si user === undefined → encara carregant sessió
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregant sessió...
      </div>
    )
  }

  // Aquí user és un objecte → OK
  return (
    <div>
      <h1>Benvingut {user.email}</h1>
    </div>
  )
}
