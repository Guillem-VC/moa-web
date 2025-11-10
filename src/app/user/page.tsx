'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function UserPage() {
  const [user, setUser] = useState<any>(undefined) // ⚠ undefined = loading
  const router = useRouter()

  useEffect(() => {
    const initUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) {
        setUser(data.session.user)
      } else {
        // Cas redirect OAuth: espera uns ms i torna a comprovar
        setTimeout(async () => {
          const { data: retry } = await supabase.auth.getSession()
          if (retry?.session?.user) setUser(retry.session.user)
          else setUser(null) // No hi ha sessió
        }, 500)
      }
    }

    initUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (_event === 'SIGNED_OUT') router.push('/') // opcional: redirigir al logout
    })

    return () => listener.subscription.unsubscribe()
  }, [router])

  // 🔹 Diferenciar loading de no loggat
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Carregant...
      </div>
    )
  }

  if (user === null) {
    router.push('/login') // només si realment no hi ha usuari
    return null
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Menú lateral */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold text-rose-700 mb-6">El meu compte</h2>
        <nav className="flex flex-col gap-3">
          <Link href="/user/profile" className="text-gray-700 hover:text-rose-600">Perfil</Link>
          <Link href="/user/orders" className="text-gray-700 hover:text-rose-600">Comandes</Link>
          <Link href="/user/addresses" className="text-gray-700 hover:text-rose-600">Direccions</Link>
          <Link href="/user/payment" className="text-gray-700 hover:text-rose-600">Pagaments</Link>
        </nav>
      </aside>

      {/* Contingut principal */}
      <main className="flex-1 p-10">
        <h1 className="text-2xl font-semibold mb-4">
          Benvingut, {user.email.split('@')[0]}
        </h1>
        <p className="text-gray-700">
          Des d’aquí pots gestionar el teu perfil, veure comandes i més opcions.
        </p>
      </main>
    </div>
  )
}
