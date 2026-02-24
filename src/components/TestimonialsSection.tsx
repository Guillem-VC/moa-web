'use client'

import React from 'react'
import { Star, Quote } from 'lucide-react'
import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Rosa Melano',
    size: '34F',
    text: "¡Por fin un sujetador deportivo que realmente funciona! Ahora puedo correr maratones sin molestias. ¡Un cambio total!",
    rating: 5,
    activity: 'Corredora de maratón'
  },
  {
    name: 'Dolores Delano',
    size: '36DD',
    text: "He probado muchas marcas, pero MOA es la única que me da soporte real durante HIIT. Vale cada euro.",
    rating: 5,
    activity: 'Atleta de CrossFit'
  },
  {
    name: 'Elba Jinaso.',
    size: '32G',
    text: "La combinación de soporte y comodidad es inigualable. Lo uso para yoga y me siento increíble todo el tiempo.",
    rating: 5,
    activity: 'Instructora de yoga'
  }
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Mujeres que aman MOA
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Únete a miles de mujeres que han encontrado su talla perfecta
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-stone-50 rounded-2xl p-8 relative"
            >
              <Quote className="w-10 h-10 text-rose-200 absolute top-6 right-6" />

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-stone-700 leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stone-900">{testimonial.name}</p>
                  <p className="text-sm text-stone-500">{testimonial.activity}</p>
                </div>
                <span className="text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                  Talla {testimonial.size}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}