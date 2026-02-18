'use client'

import { useState, useEffect } from 'react'

const Hero = () => {
  const [images, setImages] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await fetch("/api/hero-images")
        const json = await res.json()

        if (!json.ok) {
          console.error("Error loading hero images:", json.error)
          return
        }

        setImages(json.images || [])

        // Esperem un tick perquè el DOM renderitzi abans de fer-la activa
        setTimeout(() => setReady(true), 50)

      } catch (err) {
        console.error("Error fetching hero images:", err)
      }
    }

    loadImages()
  }, [])

  useEffect(() => {
    if (images.length === 0) return

    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % images.length)
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
    <section className="relative min-h-[85vh] overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt=""
            data-active={ready && index === currentImage}
            className="hero-image absolute inset-0 w-full h-full object-cover object-center"
          />
        ))}

        <div className="absolute inset-0 bg-[#f3e9dc]/25 mix-blend-multiply" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <h2 className="hero-title font-display text-6xl md:text-8xl font-semibold mb-4 tracking-tight">
          Mōa
        </h2>
        <p className="hero-subtitle text-lg md:text-xl font-light tracking-wide">
          Hold strong. Move free.
        </p>
      </div>
    </section>
  )
}

export default Hero
