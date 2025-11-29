'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        router.replace('/user')  // ruta de l'àrea d'usuari
      } else {
        router.replace('/login')
      }
    }

    checkSession()
  }, [router])

  return <div>Carregant...</div>
}