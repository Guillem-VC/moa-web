'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative h-[60vh] flex items-center justify-center text-center overflow-hidden">
        
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-black" />

        {/* Soft pattern overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-3xl px-6 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            Volvemos pronto
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-xl text-stone-200 max-w-2xl mx-auto"
          >
            Estamos realizando mejoras para ofrecerte una mejor experiencia.
            La web estará disponible de nuevo en breve.
          </motion.p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center space-y-8">

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <p className="text-stone-700 text-lg">
            Si necesitas algo urgente, puedes escribirnos a nuestro correo habitual
            o volver más tarde para descubrir las novedades.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/"
            className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-rose-700 transition duration-300"
          >
            Volver al inicio
          </Link>
        </motion.div>

      </section>
    </div>
  )
}