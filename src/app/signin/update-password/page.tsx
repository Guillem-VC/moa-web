'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const checkRecovery = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setMessage('No hay sesión activa. Vuelve a pedir reset de contraseña.')
      }
      setReady(true)
    }
    checkRecovery()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setMessage('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setMessage(error.message || 'Error actualizando contraseña')
    } else {
      setMessage('✅ Contraseña actualizada correctamente!')
      await supabase.auth.signOut()
      setTimeout(() => router.push('/signin'), 2000)
    }
  }

  if (!ready) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 via-white to-rose-100 pt-32 pb-20">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
          Restablece tu contraseña
        </h1>

        {message && (
          <p
            className={`mb-4 text-center ${
              message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-black/10 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            required
          />

          <input
            type="password"
            placeholder="Repite la contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-3 border border-black/10 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition ${
              loading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-600 to-pink-500 text-white hover:opacity-90'
            }`}
          >
            {loading ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-700 text-sm">
          Vuelve a{' '}
          <a href="/signin" className="text-rose-600 hover:underline font-medium">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  )
}