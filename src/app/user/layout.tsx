'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface UserLayoutProps {
  children: React.ReactNode
}

export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname()

  const menuItems = [
    { label: 'Perfil', href: '/user/profile' },
    { label: 'Adreces', href: '/user/addresses' },
    { label: 'Pagaments', href: '/user/payments' },
    { label: 'Comandes', href: '/user/orders' },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Menú lateral */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-4 text-rose-700">Àrea d’usuari</h2>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 rounded hover:bg-rose-50 ${
              pathname === item.href ? 'bg-rose-100 font-semibold' : 'text-gray-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Contingut de la pàgina */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
