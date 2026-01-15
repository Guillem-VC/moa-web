'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useRouter } from 'next/navigation'  

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter() 

  const handleSignup = async () => {
    setError('')

    // Validacions bàsiques
    if (!fullName || !email || !password) {
      setError('Se deben rellenar todos los campos')
      return
    }
    if (email !== confirmEmail) {
      setError('Los correos no coinciden')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }
     // 🔹 CREAR PROFILE SI EL USUARIO EXISTE
    if (data?.user) {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.user.id,
          full_name: fullName,
          email: email
        })
      })
    }
    alert('Cuenta creada correctamente! Revisa tu email.')
    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://sopotey.com/blog/wp-content/uploads/2024/04/ropa-de-marca-original.jpg"
          className="w-full h-full object-cover opacity-50 blur-md"
        />
        <div className="absolute inset-0 bg-white/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-md shadow rounded">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Crea un compte</h1>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <input
          type="text"
          placeholder="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-rose-500"
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-rose-500"
        />

        <input
          type="email"
          placeholder="Confirma el correo electrònico"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-rose-500"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-rose-500"
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-rose-600 text-white p-2 rounded hover:bg-rose-700 transition"
        >
          {loading ? 'Creando cuenta...' : 'Registrar-se'}
        </button>

        <p className="mt-4 text-center text-gray-700">
          Ja tens compte?{' '}
          <Link href="/signin" className="text-rose-600 hover:underline">
            Inicia sessió
          </Link>
        </p>
      </div>
    </div>
  )
}
