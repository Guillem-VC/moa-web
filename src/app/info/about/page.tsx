'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 text-gray-800">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-rose-700 mb-8">
          Sobre Mōa
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          <strong>Mōa</strong>  nace de una necesidad real: la falta de tops deportivos cómodos, 
          bonitos y con sujeción adecuada para mujeres con pecho grande. Durante años, muchas mujeres 
          han tenido que elegir entre entrenar con dolor o renunciar a sentirse seguras con su cuerpo. 
          MOA existe para que eso deje de pasar.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          Diseñamos prendas técnicas con un enfoque inclusivo, combinando comodidad, soporte y estética minimalista. 
          Nuestro objetivo es que cada mujer pueda moverse con libertad, confianza y sin molestias, independientemente de su talla o forma.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          Creemos en la innovación textil, la producción cuidada y el feedback de mujeres reales para crear productos que realmente funcionen.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          <strong>Mōa</strong>  Hold Strong. Move Free.
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
