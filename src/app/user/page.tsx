'use client'

import { useUser } from '@/app/layout'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function UserPage() {
  const user = useUser()
  const hasReloaded = useRef(false)

  // 🔹 Quan la sessió passa de carregant → disponible, recarrega la pàgina un cop
  useEffect(() => {
    if (user && !hasReloaded.current) {
      hasReloaded.current = true
      window.location.reload()
    }
  }, [user])

  if (user === undefined)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Carregant sessió...
      </div>
    )

  if (user === null)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        No has iniciat sessió.
        <br />
        <Link href="/login" className="text-rose-600 underline">
          Inicia sessió aquí
        </Link>
      </div>
    )

  // 🔹 Ara user és vàlid → pàgina d'usuari
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold text-rose-700 mb-6">El meu compte</h2>
        <nav className="flex flex-col gap-3">
          <Link href="/user/profile" className="text-gray-700 hover:text-rose-600">Perfil</Link>
          <Link href="/user/orders" className="text-gray-700 hover:text-rose-600">Comandes</Link>
          <Link href="/user/addresses" className="text-gray-700 hover:text-rose-600">Direccions</Link>
          <Link href="/user/payment" className="text-gray-700 hover:text-rose-600">Pagaments</Link>
        </nav>
      </aside>

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
