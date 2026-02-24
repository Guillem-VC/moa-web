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
      options: { data: { full_name: fullName } }
    })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 via-white to-rose-100 pt-32 pb-20">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
          Crea tu cuenta
        </h1>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 border border-black/10 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-black/10 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          />

          <input
            type="email"
            placeholder="Confirma el correo electrónico"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="w-full p-3 border border-black/10 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-black/10 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          />
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className={`w-full py-3 rounded-2xl font-semibold mt-4 flex items-center justify-center transition ${
            loading
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-600 to-pink-500 text-white hover:opacity-90'
          }`}
        >
          {loading ? 'Creando cuenta...' : 'Registrarse'}
        </button>

        <p className="mt-6 text-center text-gray-700 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link href="/signin" className="text-rose-600 hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}