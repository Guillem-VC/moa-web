'use client'

import { useState, useEffect } from 'react'

const images = [
  "/foto1.jpg",
  "https://dqoihydizvfnfnbrsauf.supabase.co/storage/v1/object/public/Hero_images/moa1.jpeg"
]

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % images.length)
    }, 9000) // una mica més llarg
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-[85vh] overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt=""
            data-active={index === currentImage}
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
