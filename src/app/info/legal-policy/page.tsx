'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type HeroImage = {
  url: string
  alt?: string
}

export default function AvisoLegalPage() {
  const [images, setImages] = useState<HeroImage[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/about-images')
        const data = await res.json()
        if (data.ok && Array.isArray(data.images)) {
          setImages(data.images)
        }
      } catch (err) {
        console.error('Error loading hero image:', err)
      }
    }
    fetchImages()
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative h-[50vh] flex items-center justify-center text-center">
        {images[0] && (
          <motion.img
            src={images[0].url}
            alt={images[0].alt || 'Hero image'}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          />
        )}

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-3xl px-6 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4"
          >
            Aviso Legal y Política de Privacidad
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto"
          >
            Información legal sobre el tratamiento de datos y el uso de nuestra web.
          </motion.p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-16">

        <div className="space-y-10 text-stone-700 text-lg leading-relaxed">

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              1. Responsable del tratamiento
            </h2>
            <p>
              El responsable de los datos es Cynthia Fernandez Masip (MOA).
              Los datos personales recopilados, como tu correo electrónico,
              se usarán únicamente para fines relacionados con nuestra actividad:
              envío de información, promociones y novedades.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              2. Datos que recogemos
            </h2>
            <p>Recogemos únicamente los datos que tú nos facilitas voluntariamente:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Correo electrónico</li>
              <li>Nombre (opcional)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              3. Finalidad del tratamiento
            </h2>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Enviar boletines informativos y comunicaciones sobre nuestros productos y servicios.</li>
              <li>Informarte de novedades y promociones.</li>
              <li>Gestionar la suscripción y garantizar la seguridad de nuestros servicios.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              4. Base legal
            </h2>
            <p>
              El tratamiento de tus datos se realiza con tu consentimiento explícito
              al suscribirte en nuestra web.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              5. Conservación de los datos
            </h2>
            <p>
              Tus datos se conservarán mientras mantengas tu suscripción
              o hasta que solicites su eliminación.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              6. Derechos de los usuarios
            </h2>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Acceder a tus datos.</li>
              <li>Rectificarlos si son incorrectos.</li>
              <li>Solicitar su supresión (“derecho al olvido”).</li>
              <li>Limitar u oponerte al tratamiento.</li>
              <li>Solicitar la portabilidad de tus datos.</li>
            </ul>

            <p className="mt-4">
              Para ejercer tus derechos, puedes escribir a:{' '}
              <span className="font-semibold text-stone-900">
                contact.moasport@gmail.com
              </span>
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              7. Seguridad
            </h2>
            <p>
              Adoptamos las medidas técnicas y organizativas necesarias
              para proteger tus datos frente a accesos no autorizados,
              pérdidas o alteraciones.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              8. Cookies
            </h2>
            <p>
              Nuestra web puede usar cookies para mejorar tu experiencia
              y analizar estadísticas de visitas.
            </p>
          </div>

        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block mt-6 bg-rose-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-rose-700 transition"
          >
            Volver al inicio
          </Link>
        </div>

      </section>
    </div>
  )
}