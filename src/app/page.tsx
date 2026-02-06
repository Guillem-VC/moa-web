'use client'

import Hero from '@/components/Hero'
import Features from '@/components/Features'
import ProductGrid from '@/components/ProductGrid'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="">
        <Hero />
        <Features />
        <ProductGrid />
      </main>
    </div>
  )
}
