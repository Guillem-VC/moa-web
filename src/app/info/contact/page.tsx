'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, Phone, MessageSquare, Clock, MapPin, Send } from 'lucide-react'
import { SiWhatsapp } from 'react-icons/si'

type ContactInfo = {
  email: string
  responseTime: string
}
type ContactImage = {
  url: string
  alt?: string
}

export default function ContactPage() {
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [images, setImages] = useState<ContactImage[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setContact({
      email: 'contact.moasport@gmail.com',
      responseTime: '24–48 horas laborables',
    })
  }, [])

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/about-images')
        const data = await res.json()
        if (data.ok && Array.isArray(data.images)) {
          setImages(data.images)
        } else {
          console.error('Error loading images:', data.error)
        }
      } catch (err) {
        console.error('Error fetching about images:', err)
      }
    }
    fetchImages()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })

      setTimeout(() => {
        setSubmitted(false)
        setIsSubmitting(false)
      }, 3000)
      alert("Mensaje enviado correctamente!")

    } catch (err) {
      console.error(err)
      alert('Error sending message')
      setIsSubmitting(false)
    }
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      description: contact?.email || 'support@moa.com',
      detail: 'Respuesta en 24–48 horas laborables'
    },
    {
      icon: Phone,
      title: 'Teléfono',
      description: '696969696',
      detail: 'Lunes-Viernes, 9am-6pm'
    },
    {
      icon: SiWhatsapp,
      title: 'WhatsApp',
      description: '696969696',
      detail: 'Lunes-Viernes, 9am-6pm'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 text-gray-800">
      {/* HERO */}
      <section className="relative h-[70vh] flex items-end">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-6 pb-16 flex flex-col items-center justify-center text-center text-white h-full">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Contacto
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-lg md:text-xl max-w-2xl text-white/85"
          >
            En <strong>Mōa</strong> estaremos encantadas de ayudarte.
          </motion.p>
        </div>
      </section>

      {/* CONTACT METHODS */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <motion.div
              key={`${method.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-stone-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <method.icon className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-1">{method.title}</h3>
              <p className="text-stone-900 font-medium mb-1">{method.description}</p>
              <p className="text-sm text-stone-500">{method.detail}</p>
            </motion.div>
          ))}
        </div>

        {/* CONTACT FORM + ADDITIONAL INFO */}
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-stone-900 mb-6">Envianos un mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Elber Galarga"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="elbergalarga@example.com"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="¿?"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  maxLength={400}
                  placeholder="Cómo podemos ayudarte?"
                  rows={6}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-sm ${
                      formData.message.length > 900
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {formData.message.length}/400
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-12 rounded-lg flex items-center justify-center gap-2 transition
                  ${isSubmitting
                    ? 'bg-stone-500 cursor-not-allowed text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
              >
                {isSubmitting
                  ? 'Enviando...'
                  : <><Send className="w-4 h-4" /> Enviar mensaje</>}
              </button>
            </form>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {/* Office Hours */}
            <div className="bg-stone-50 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-rose-500" />
                <h3 className="text-xl font-semibold text-stone-900">Horario de Oficina</h3>
              </div>
              <div className="space-y-3 text-stone-600">
                <div className="flex justify-between"><span>Lunes - Viernes</span><span className="font-medium">9:00 AM - 6:00 PM</span></div>
                <div className="flex justify-between"><span>Sábados y Domingos</span><span className="font-medium">Cerrado</span></div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-stone-50 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-rose-500" />
                <h3 className="text-xl font-semibold text-stone-900">Sede</h3>
              </div>
              <address className="not-italic text-stone-600 space-y-1">
                <p>MOA Sportswear Inc.</p>
                <p>123 Fitness Avenue</p>
                <p>Barcelona, BCN 08080</p>
                <p>Cataluña, España</p>
              </address>
            </div>

            {/* Response Time */}
            <div className="border-l-4 border-rose-500 bg-rose-50 rounded-r-xl p-6">
              <p className="text-sm text-stone-700">
                <strong className="text-stone-900">Tiempo de respuesta estimada:</strong> {contact?.responseTime || '24–48 hours'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="py-12 text-center">
        <Link
          href="/"
          className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-rose-700 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}