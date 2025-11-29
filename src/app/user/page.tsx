'use client'

import Link from 'next/link'
import { useUser } from '@/app/layout' // 🔹 Importem el hook del layout
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UserPage() {
 const user = useUser();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Redirigeix només si hem carregat i no hi ha usuari
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  if (user === undefined) return <div>Carregant...</div>;
  if (user === null) return null; // redirecció en curs

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
