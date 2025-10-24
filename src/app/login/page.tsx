'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useCartStore } from '@/store/cartStore' // <-- importa el store

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { loadCart, syncCartWithSupabase } = useCartStore()

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else router.push('/') // redirigeix a home
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/` // després del login
      }
    })
    if (error) setError(error.message)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && email && password) {
      handleLogin()
    }
  }

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        console.log('Usuari logejat, sincronitzant carrito...')
        syncCartWithSupabase()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [syncCartWithSupabase])

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Introdueix el teu correu per restablir la contrasenya')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/update-password` // pàgina on canviar la contrasenya
    })
    setLoading(false)

    if (error) setError(error.message)
    else alert('Revisa el teu correu per restablir la contrasenya')
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

      <div className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-md shadow-lg rounded-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Inicia sessió</h1>

        {error && <p className="text-red-600 mb-3 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Correu electrònic"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 mb-4 border border-gray-300 rounded placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-rose-500"
        />

        <input
          type="password"
          placeholder="Contrasenya"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 mb-4 border border-gray-300 rounded placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-rose-500"
        />

        <p className="text-right mb-4">
          <a
            href="/login/forgot-password"
            className="text-sm text-rose-600 hover:underline"
          >
            Has oblidat la contrasenya?
          </a>
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-rose-600 text-white p-2 rounded hover:bg-rose-700 transition font-medium"
        >
          {loading ? 'Iniciant sessió...' : 'Entrar'}
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500 text-sm">o continua amb</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 placeholder-gray-500 text-black bg-white hover:bg-gray-300 p-2 rounded transition font-medium"
        >
          <FcGoogle size={22} />
          <span>Inicia sessió amb Google</span>
        </button>

        <p className="mt-6 text-center text-gray-700">
          Encara no tens compte?{' '}
          <Link href="/signup" className="text-rose-600 hover:underline font-medium">
            Registra’t
          </Link>
        </p>
      </div>
    </div>
  )
}
