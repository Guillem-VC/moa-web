'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (access_token && refresh_token) {
      // Cridem una API route per posar les cookies server-side
      fetch('/api/auth/set-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token, refresh_token }),
        credentials: "include",  
      }).then(() => {
        router.replace('/user') // redirigim
      })
    } else {
      router.replace('/login')
    }
  }, [router])

  return <div>Carregant sessió...</div>
}
