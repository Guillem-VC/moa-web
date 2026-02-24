'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type HeroImage = {
  url: string
  alt?: string
}

export default function FitFinder() {
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
      <section className="relative h-[60vh] flex items-center justify-center text-center">

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

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 max-w-3xl px-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex justify-center"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Fit Finder
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/90"
          >
            Discover your perfect MOA fit in just a few simple steps.
          </motion.p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-stone-50 rounded-2xl p-10 text-center"
          >
            <h2 className="text-2xl font-semibold text-stone-900 mb-4">
              Coming Soon
            </h2>

            <p className="text-stone-600 mb-8 max-w-xl mx-auto">
              We are building an interactive experience to help you determine 
              your perfect size based on your measurements and preferences.
            </p>

            <Button className="bg-stone-900 hover:bg-stone-800 text-white">
              Get Notified
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>

        </div>
      </section>

    </div>
  )
}