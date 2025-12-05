'use client'

import { useUser } from '@/app/layout'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function UserPage() {
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user === null) {
      router.push('/login')
    }
  }, [user, router])

  if (user === undefined)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregant...
      </div>
    )

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold text-rose-700 mb-6">El meu compte</h2>
        <nav className="flex flex-col gap-3">
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-2xl font-semibold mb-4">
          Benvingut, {user.email.split('@')[0]}
        </h1>
      </main>
    </div>
  )
}
