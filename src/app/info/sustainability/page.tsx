'use client'

import Link from 'next/link'

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 text-gray-800">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-rose-700 mb-8">
          Sostenibilidad
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          A <strong>Mōa</strong> creemos que crear mejor ropa también significa hacerlo de forma responsable. 
          Por eso apostamos por una producción local y cuidada, trabajando con talleres cercanos que nos permiten 
          supervisar la calidad, reducir transportes innecesarios y apoyar la economía de proximidad.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          Nuestro enfoque se basa en producir de forma consciente, evitando excedentes mediante tiradas limitadas 
          y sistemas de preventa cuando es posible. Buscamos materiales duraderos y de calidad para que cada prenda 
          tenga una vida útil larga, reduciendo el impacto del consumo rápido.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
        La sostenibilidad para MOA no es solo un objetivo, sino una forma de crecer de manera coherente con nuestros valores: 
        respeto, calidad y responsabilidad.
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