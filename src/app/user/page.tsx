// app/user/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabaseClient'

export default async function UserPage() {
  const sbCookies = await cookies()
  const access_token = sbCookies.get('sb-access-token')?.value

  if (!access_token) {
    redirect('/cart')
  }

  // Si vols, pots obtenir l'usuari server-side amb Supabase
  const { data: { user } } = await supabase.auth.getUser(access_token)

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold text-rose-700 mb-6">El meu compte</h2>
        <nav className="flex flex-col gap-3">
          <a href="#" className="text-gray-700 hover:text-rose-600">Perfil</a>
          <a href="#" className="text-gray-700 hover:text-rose-600">Comandes</a>
        </nav>
      </aside>
      <main className="flex-1 p-10">
        <h1 className="text-2xl font-semibold mb-4">Benvingut, {user?.email}</h1>
        <p className="text-gray-700">Des d’aquí pots gestionar el teu perfil, veure comandes i més opcions.</p>
      </main>
    </div>
  )
}
