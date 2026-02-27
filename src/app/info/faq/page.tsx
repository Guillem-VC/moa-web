'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

type HeroImage = {
  url: string
  alt?: string
}

const faqData = {
  pedidos: [
    { question: "¿Cómo realizo un pedido?", answer: "Solo navega por nuestros productos, añade artículos al carrito y procede al pago." },
    { question: "¿Puedo modificar o cancelar mi pedido?", answer: "Puedes modificar o cancelar tu pedido dentro de las 2 horas posteriores." },
    { question: "¿Qué métodos de pago aceptan?", answer: "Aceptamos tarjetas principales, PayPal, Apple Pay y Google Pay." }
  ],
  envios: [
    { question: "¿Cuánto tarda el envío?", answer: "Los envíos estándar tardan 3-5 días hábiles." },
    { question: "¿Ofrecen envío gratuito?", answer: "Sí, en pedidos superiores a 100€." }
  ],
  tallas: [
    { question: "¿Cómo encuentro mi talla?", answer: "Consulta nuestra Guía de Tallas." }
  ],
  devoluciones: [
    { question: "¿Cuál es su política de devoluciones?", answer: "Aceptamos devoluciones dentro de los 30 días." }
  ]
}

export default function FAQPage() {
  const [images, setImages] = useState<HeroImage[]>([])
  const [activeTab, setActiveTab] = useState('pedidos')
  const [openItem, setOpenItem] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/about-images')
        const data = await res.json()
        if (data.ok && Array.isArray(data.images)) {
          setImages(data.images)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchImages()
  }, [])

  const filterFAQs = (faqs: any[]) => {
    if (!searchQuery) return faqs
    return faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const currentFAQs = filterFAQs(faqData[activeTab as keyof typeof faqData])

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
          <h1 className="text-5xl font-bold mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-lg max-w-2xl mx-auto">
            Resolvemos tus dudas sobre pedidos, envíos y devoluciones.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="bg-stone-50 py-24">
        <div className="max-w-4xl mx-auto px-6">

          {/* SEARCH */}
          <div className="relative max-w-md mx-auto mb-16">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar preguntas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 h-14 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            />
          </div>

          {/* TABS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
            {Object.keys(faqData).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setOpenItem(null)
                }}
                className={`py-3 rounded-xl font-medium transition ${
                  activeTab === tab
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* ACCORDION */}
          <div className="space-y-4">
            {currentFAQs.map((faq, index) => {
              const itemKey = `${activeTab}-${index}`
              const isOpen = openItem === itemKey

              return (
                <div
                  key={itemKey}
                  className="bg-white rounded-xl border border-stone-200 shadow-sm"
                >
                  <button
                    onClick={() =>
                      setOpenItem(isOpen ? null : itemKey)
                    }
                    className="w-full text-left px-6 py-4 font-semibold text-stone-900"
                  >
                    {faq.question}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-stone-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}

            {currentFAQs.length === 0 && (
              <div className="text-center py-12 text-stone-500">
                No se encontraron resultados para "{searchQuery}"
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  )
}