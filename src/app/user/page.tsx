// app/user/page.tsx
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function UserPage() {
  const sbCookies = await cookies()
  const access_token = sbCookies.get('sb-access-token')?.value

  if (!access_token) {
    redirect('/')
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user } } = await supabaseAdmin.auth.getUser(access_token)

  if (!user) {
    redirect('/login')
  }

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
          Benvingut
        </h1>
        <p className="text-gray-700">
          Des d’aquí pots gestionar el teu perfil, veure comandes i més opcions.
        </p>
      </main>
    </div>
  )
}
