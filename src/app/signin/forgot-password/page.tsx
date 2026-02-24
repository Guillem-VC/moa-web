'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setMessage("Introduce tu correo electrónico.")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/signin/update-password`,
    })
    setLoading(false)

    if (error) {
      setMessage("❌ " + error.message)
    } else {
      setMessage("✅ Revisa tu correo para restablecer la contraseña.")
      setTimeout(() => router.push("/"), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 via-white to-rose-100 pt-32 pb-20">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6 text-center">
          ¿Has olvidado la contraseña?
        </h1>

        <p className="text-center text-gray-600 mb-4 text-sm">
          Introduce tu correo electrónico y te enviaremos un enlace para restablecerla.
        </p>

        {message && (
          <p
            className={`mb-4 text-center ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Enviando..." : "Enviar correo de restablecimiento"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-700 text-sm">
          Vuelve a{" "}
          <a href="/signin" className="text-rose-600 hover:underline font-medium">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  )
}