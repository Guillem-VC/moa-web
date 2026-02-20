'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const Hero = () => {
  const [images, setImages] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [ready, setReady] = useState(false)

  // Carrega les imatges des de Supabase
  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await fetch('/api/hero-images')
        const json = await res.json()
        if (!json.ok) {
          console.error('Error loading hero images:', json.error)
          return
        }
        setImages(json.images || [])
        setTimeout(() => setReady(true), 50)
      } catch (err) {
        console.error('Error fetching hero images:', err)
      }
    }
    loadImages()
  }, [])

  // Canvi automàtic d’imatge cada 9s
  useEffect(() => {
    if (images.length === 0) return
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 9000)
    return () => clearInterval(interval)
  }, [images])

  if (images.length === 0) {
    return (
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[#f3e9dc]">
        <p className="text-gray-500">Cargando...</p>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-stone-50">
      {/* Imatges de fons amb zoom i fade */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence>
          {images.map((img, index) =>
            index === currentImage ? (
              <motion.img
                key={index}
                src={img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 1, scale: [1, 1.05, 1] }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 1.5 },
                  scale: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
            ) : null
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/50 to-transparent" />
      </div>

      {/* Contingut */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-32 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl text-center md:text-left"
        >
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
            Designed for D+ Cup Sizes
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Move Without <span className="block text-rose-400">Limits</span>
          </h1>

          <p className="text-lg text-white/80 mb-8 leading-relaxed">
            Premium sport tops engineered for women with fuller busts. Maximum support, minimal bounce, and ultimate comfort—no matter how intense your workout.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link href="/">
              <Button
                size="lg"
                className="bg-white text-stone-900 hover:bg-stone-100 rounded-full px-8 h-14 text-base font-semibold"
              >
                Shop Collection
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14 text-base font-semibold"
              >
                Find Your Fit
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-3 bg-white/60 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  )
}

export default Hero