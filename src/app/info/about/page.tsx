'use client'

import { motion } from 'framer-motion'
import { Heart, Shield, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'

const values = [
  {
    icon: Heart,
    title: 'Soporte real',
    description:
      'Diseñamos tops pensados específicamente para pechos grandes, con estructuras internas que reducen el impacto sin sacrificar comodidad.'
  },
  {
    icon: Shield,
    title: 'Confianza absoluta',
    description:
      'Cada prenda está testada para garantizar estabilidad, seguridad y libertad de movimiento en cualquier tipo de entrenamiento.'
  },
  {
    icon: Sparkles,
    title: 'Diseño consciente',
    description:
      'Minimalismo funcional: eliminamos lo innecesario y priorizamos tejidos técnicos, acabados cuidados y estética limpia.'
  },
  {
    icon: Users,
    title: 'Mujeres reales',
    description:
      'Escuchamos a nuestra comunidad y desarrollamos productos basados en experiencias reales, no en estándares irreales.'
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* HERO */}
      <section className="relative h-[70vh] flex items-end">
        <img
          src="https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=1920"
          alt="Mujer entrenando"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-6 pb-16 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Diseñado para mujeres que no aceptan límites
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl max-w-2xl text-white/85"
          >
            Mōa nace para resolver un problema real: ofrecer soporte técnico,
            comodidad y estética a mujeres con pecho grande que quieren entrenar sin restricciones.
          </motion.p>
        </div>
      </section>

      {/* MISIÓN */}
      <section className="py-24 bg-rose-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-rose-600 font-semibold block mb-4">
            Nuestra misión
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Redefinir el soporte deportivo femenino
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Durante años, muchas mujeres han tenido que elegir entre entrenar con
            molestias o renunciar a sentirse seguras con su cuerpo. En Mōa creemos
            que esa elección no debería existir. Creamos prendas técnicas que
            combinan ingeniería textil, soporte estructural y diseño minimalista
            para que puedas moverte con libertad y confianza.
          </p>
        </div>
      </section>

      {/* VALORES */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lo que nos define
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cada decisión de diseño está guiada por un compromiso real con la calidad,
              la funcionalidad y el respeto por el cuerpo femenino.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-7 h-7 text-rose-600" />
                </div>
                <h3 className="font-semibold text-lg mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900"
              alt="Entrenamiento femenino"
              className="rounded-2xl shadow-lg"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-rose-600 font-semibold block mb-4">
              El origen
            </span>
            <h2 className="text-3xl font-bold mb-6">
              De la frustración a la innovación
            </h2>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Mōa surge al observar cómo muchas mujeres evitaban ciertos
                entrenamientos por falta de soporte adecuado. No era una cuestión
                estética: era una limitación física real.
              </p>
              <p>
                Investigamos materiales técnicos, probamos estructuras internas
                de sujeción y escuchamos a mujeres con copas grandes que
                necesitaban una solución definitiva.
              </p>
              <p>
                El resultado es una colección diseñada para acompañar cada
                movimiento, sin compromisos.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Hold Strong. Move Free.
        </h2>
        <Link
          href="/"
          className="inline-block bg-rose-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-rose-700 transition"
        >
          Descubrir la colección
        </Link>
      </section>

    </div>
  )
}