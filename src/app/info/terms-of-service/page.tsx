'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type HeroImage = {
  url: string
  alt?: string
}

export default function TermsOfServicePage() {
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
            Términos y Condiciones
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto"
          >
            Normas que regulan el acceso y uso de nuestra web y servicios.
          </motion.p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-16">

        <div className="space-y-10 text-stone-700 text-lg leading-relaxed">

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              1. Aceptación de los términos
            </h2>
            <p>
              Al acceder y utilizar esta web, aceptas cumplir los presentes
              términos y condiciones. Si no estás de acuerdo con alguno de ellos,
              te recomendamos no utilizar nuestros servicios.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              2. Uso del sitio web
            </h2>
            <p>
              El usuario se compromete a hacer un uso adecuado del sitio web,
              respetando la legislación vigente y evitando cualquier actividad
              que pueda dañar la imagen, los intereses o los derechos de MOA
              o de terceros.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              3. Propiedad intelectual
            </h2>
            <p>
              Todos los contenidos del sitio web (textos, imágenes, diseños,
              logotipos y elementos gráficos) son propiedad de MOA o cuentan
              con licencia para su uso. Queda prohibida su reproducción,
              distribución o modificación sin autorización previa.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              4. Responsabilidad
            </h2>
            <p>
              MOA no se hace responsable de posibles errores en los contenidos
              ni de los daños derivados del uso del sitio web. Nos reservamos
              el derecho a modificar o actualizar la información en cualquier momento.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              5. Enlaces externos
            </h2>
            <p>
              Esta web puede contener enlaces a sitios de terceros.
              MOA no se responsabiliza del contenido ni de las políticas
              de privacidad de dichos sitios externos.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              6. Modificaciones
            </h2>
            <p>
              Nos reservamos el derecho de modificar los presentes términos
              en cualquier momento. Las modificaciones serán efectivas desde
              su publicación en esta página.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              7. Legislación aplicable
            </h2>
            <p>
              Estos términos se rigen por la legislación española.
              Para cualquier controversia, las partes se someterán
              a los juzgados y tribunales competentes.
            </p>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center mt-10">
          <Link
            href="/"
            className="inline-block bg-rose-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-rose-700 transition"
          >
            Volver al inicio
          </Link>
        </div>

      </section>
    </div>
  )
}