'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 text-gray-800">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-rose-700 mb-8">
          Contacto
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          En <strong>Mōa</strong> estaremos encantadas de ayudarte.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">        
          Si tienes dudas sobre productos, tallas, pedidos o devoluciones, 
          puedes escribirnos en cualquier momento y te responderemos lo antes posible.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          📩 Email: contact.moasport@gmail.com
        </p>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          Nuestro equipo de atención al cliente responde habitualmente en un plazo de 24–48 horas laborables.
        </p>
        <Link
          href="/"
          className="inline-block mt-8 bg-rose-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-rose-700 transition"
        >
          Volver al inicio
        </Link>
      </section>
    </div>
  )
}
