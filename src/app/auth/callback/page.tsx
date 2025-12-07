'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error obtenint sessió:', error)
        return
      }

      if (data.session?.user) {
        // Ja estem loggats, anem a la pàgina principal
        router.replace('/')
      } else {
        console.warn('No hi ha sessió activa')
      }
    }

    handleAuth()
  }, [router])

  return <p>Processant login...</p>
}
