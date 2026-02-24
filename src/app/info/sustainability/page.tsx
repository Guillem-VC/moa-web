'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type HeroImage = {
  url: string
  alt?: string
}

export default function SustainabilityPage() {
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
            Sostenibilidad
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto"
          >
            Creemos que crear mejor ropa también significa hacerlo de forma responsable.
          </motion.p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-12">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <p className="text-stone-700 text-lg leading-relaxed">
            A <strong>Mōa</strong> creemos que crear mejor ropa también significa hacerlo de forma responsable. 
            Por eso apostamos por una producción local y cuidada, trabajando con talleres cercanos que nos permiten 
            supervisar la calidad, reducir transportes innecesarios y apoyar la economía de proximidad.
          </p>

          <p className="text-stone-700 text-lg leading-relaxed">
            Nuestro enfoque se basa en producir de forma consciente, evitando excedentes mediante tiradas limitadas 
            y sistemas de preventa cuando es posible. Buscamos materiales duraderos y de calidad para que cada prenda 
            tenga una vida útil larga, reduciendo el impacto del consumo rápido.
          </p>

          <p className="text-stone-700 text-lg leading-relaxed">
            La sostenibilidad para MOA no es solo un objetivo, sino una forma de crecer de manera coherente con nuestros valores: 
            respeto, calidad y responsabilidad.
          </p>
        </motion.div>

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