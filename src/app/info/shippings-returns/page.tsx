'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type HeroImage = {
  url: string
  alt?: string
}

export default function ShippingPage() {
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
            Envíos & Devoluciones
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto"
          >
            Información sobre envíos, devoluciones y garantías para tu tranquilidad.
          </motion.p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-16">

        {/* Shipping Info */}
        <div>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Envíos</h2>
          <p className="text-stone-700 mb-4">
            Los pedidos se preparan y envían en un plazo de 24–72 horas laborables desde la confirmación de compra
            (salvo periodos especiales o lanzamientos). Una vez enviado, el tiempo de entrega dependerá de la empresa logística seleccionada.
          </p>
          <p className="text-stone-700">
            Ten en cuenta que pueden producirse retrasos ajenos a MOA debido a incidencias de transporte,
            periodos de alta demanda o circunstancias externas. En caso de cualquier problema, te ayudaremos a gestionarlo lo antes posible.
          </p>
        </div>

        {/* Returns Info */}
        <div>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Devoluciones</h2>
          <p className="text-stone-700 mb-6">
            Para que la devolución sea aceptada:
          </p>
          <ul className="list-decimal list-inside space-y-2 text-stone-700 mb-6">
            <li>La prenda debe estar sin usar.</li>
            <li>Debe conservar etiquetas y embalaje original.</li>
            <li>No debe presentar daños ni signos de uso.</li>
          </ul>
          <p className="text-stone-700 mb-6">
            Una vez recibamos el producto y verifiquemos su estado, se realizará el reembolso mediante el mismo método de pago utilizado en la compra.
          </p>
          <p className="text-stone-700">
            Para solicitar un cambio o devolución, puedes contactar con nosotros a través del correo de atención al cliente indicando tu número de pedido.
          </p>
        </div>

        {/* Back Link */}
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