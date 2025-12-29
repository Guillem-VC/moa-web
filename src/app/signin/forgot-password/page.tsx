"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage("Introdueix el teu correu electrònic.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/signin/update-password`,
    });
    setLoading(false);

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Revisa el teu correu per restablir la contrasenya.");
      // 👇 Espera un moment i redirigeix a la home
      setTimeout(() => router.push("/"), 2000);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fons */}
      <div className="absolute inset-0">
        <img
          src="https://sopotey.com/blog/wp-content/uploads/2024/04/ropa-de-marca-original.jpg"
          className="w-full h-full object-cover opacity-50 blur-md"
        />
        <div className="absolute inset-0 bg-white/40"></div>
      </div>

      {/* Formulari */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-md shadow-lg rounded-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Has oblidat la contrasenya?
        </h1>

        <p className="text-center text-gray-600 mb-4 text-sm">
          Introdueix el teu correu electrònic i t’enviarem un enllaç per restablir-la.
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

        <form onSubmit={handleForgotPassword}>
          <input
            type="email"
            placeholder="Correu electrònic"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded placeholder-gray-500 text-black focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 text-white p-2 rounded hover:bg-rose-700 transition font-medium"
          >
            {loading ? "Enviant..." : "Enviar correu de restabliment"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-700 text-sm">
          Torna a{" "}
          <a href="/signin" className="text-rose-600 hover:underline font-medium">
            Inicia sessió
          </a>
        </p>
      </div>
    </div>
  );
}
