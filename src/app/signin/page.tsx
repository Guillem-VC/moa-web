'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { motion, Variants } from 'framer-motion'

export default function SigninPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { syncCartWithSupabase } = useCartStore()

  const handleSignin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      await syncCartWithSupabase()
      router.push('/')
    }
  }

  const handleGoogleSignin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://moa-web-v1.vercel.app/auth/callback' } //'http://localhost:3000/auth/callback' 'https://moa-web-v1.vercel.app/auth/callback'
    })
    if (error) setError(error.message)
    else router.push('/')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && email && password) handleSignin()
  }

  // Animacions per al form i inputs
  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.1 }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring' as const, stiffness: 120 } 
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 via-white to-rose-100 pt-32 pb-20">
      <motion.div 
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-8"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <motion.h1 
          className="text-3xl font-semibold text-gray-900 mb-6 text-center"
          variants={item}
        >
          Inicia sesión
        </motion.h1>

        {error && (
          <motion.p 
            className="text-red-600 mb-3 text-center"
            variants={item}
          >
            {error}
          </motion.p>
        )}

        <motion.input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 mb-4 border border-black/10 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          variants={item}
        />

        <motion.input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 mb-4 border border-black/10 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          variants={item}
        />

        <motion.p className="text-right mb-4" variants={item}>
          <Link href="/signin/forgot-password" className="text-sm text-rose-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </motion.p>

        <motion.button
          onClick={handleSignin}
          disabled={loading}
          className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition ${
            loading
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-600 to-pink-500 text-white hover:opacity-90'
          }`}
          variants={item}
        >
          {loading ? 'Procesando...' : 'Entrar'}
        </motion.button>

        <motion.div className="flex items-center my-6" variants={item}>
          <div className="flex-grow border-t border-black/10"></div>
          <span className="mx-2 text-gray-500 text-sm">o continua con</span>
          <div className="flex-grow border-t border-black/10"></div>
        </motion.div>

        <motion.button
          onClick={handleGoogleSignin}
          className="w-full flex items-center justify-center gap-2 border border-black/10 bg-white hover:bg-gray-100 p-3 rounded-2xl transition font-medium text-gray-900"
          variants={item}
        >
          <FcGoogle size={22} />
          <span>Inicia sesión con Google</span>
        </motion.button>

        <motion.p className="mt-6 text-center text-gray-700" variants={item}>
          ¿No tienes cuenta aún?{' '}
          <Link href="/signup" className="text-rose-600 hover:underline font-medium">
            Regístrate
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}