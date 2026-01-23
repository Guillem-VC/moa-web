'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useCartStore } from '@/store/cartStore'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { syncCartWithSupabase } = useCartStore()

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

      console.log('[AuthCallback] User detected, syncing cart...')
      // 🔹 Sincronitzem el carret local amb Supabase
      await syncCartWithSupabase()

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
  }, [router, syncCartWithSupabase])

  return <div>Processing login</div>
}
