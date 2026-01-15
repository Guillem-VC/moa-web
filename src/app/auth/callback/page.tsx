'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error(error)
        router.push('/signin')
        return
      }

      const user = data.session?.user
      if (!user) {
        router.push('/signin')
        return
      }

      // Crida la teva API per crear profile si no existeix
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          full_name: user.user_metadata.full_name || user.user_metadata.name,
          email: user.email
        })
      })

      router.push('/') // redirigeix a home
    }

    handleCallback()
  }, [router])

  return <div>Procesant login...</div>
}
