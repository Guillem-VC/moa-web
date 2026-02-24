'use client'

import { useRef } from 'react'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import ProductGrid from '@/components/ProductGrid'
import TestimonialsSection from '@/components/TestimonialsSection' // nova secció

export default function Home() {
  const productGridRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero amb scroll */}
        <Hero scrollToProductGrid={() => {
          productGridRef.current?.scrollIntoView({ behavior: 'smooth' })
        }} />

        <Features />

        {/* Product Grid */}
        <div ref={productGridRef}>
          <ProductGrid />
        </div>

        {/* Testimonios sota ProductGrid */}
        <TestimonialsSection />
      </main>
    </div>
  )
}