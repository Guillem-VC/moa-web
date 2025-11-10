'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function UserPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      let { data } = await supabase.auth.getSession();
      if (!data?.session?.user) {
        // Cas Vercel / OAuth redirect delay
        setTimeout(async () => {
          const { data: retry } = await supabase.auth.getSession();
          setUser(retry?.session?.user ?? null);
        }, 500);
      } else {
        setUser(data.session.user);
      }
    }

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!_event.includes('SIGNED_IN')) return;
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);


  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Carregant...
      </div>
    )

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Menú lateral */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold text-rose-700 mb-6">El meu compte</h2>
        <nav className="flex flex-col gap-3">
          <Link href="/user/profile" className="text-gray-700 hover:text-rose-600">
            Perfil
          </Link>
          <Link href="/user/orders" className="text-gray-700 hover:text-rose-600">
            Comandes
          </Link>
          <Link href="/user/addresses" className="text-gray-700 hover:text-rose-600">
            Direccions
          </Link>
          <Link href="/user/payment" className="text-gray-700 hover:text-rose-600">
            Pagaments
          </Link>
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
