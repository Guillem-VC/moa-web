'use client'

import { useState, useEffect } from 'react'

const images = [
  "/foto1.jpg",
  'https://dqoihydizvfnfnbrsauf.supabase.co/storage/v1/object/public/Hero_images/moa1.jpeg'
];

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 8000) // cada 8 segons
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Hero ${index}`}
            className={`
              absolute inset-0 w-full h-full object-cover object-center
              transition-opacity duration-[1500ms] ease-in-out
              ${index === currentImage ? 'opacity-100 animate-hero-zoom' : 'opacity-0'}
            `}
          />
        ))}
        <div className="absolute inset-0 bg-[#f3e9dc]/25 mix-blend-multiply" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <h2 className="font-display text-6xl md:text-8xl font-semibold text-foreground mb-4 tracking-tight">
          Mōa
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground font-light tracking-wide">
          Hold strong. Move free.
        </p>
      </div>
    </section>
  )
}

export default Hero
