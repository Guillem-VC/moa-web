'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore' // <-- importa el store

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const perPage = 6
  const loader = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLElement>(null) // <-- Ref per al product grid
  const { loadCart } = useCartStore() // <-- agafa la funció del store

  const fetchProducts = async (page: number) => {
    if (!hasMore) return
    setLoading(true)

    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .range(from, to)

    if (error) {
      console.error(error)
    } else {
      const newProducts = data || []

      setProducts((prev) => {
        // Filtrar els productes que ja tenim a prev
        const filtered = newProducts.filter(
          (p) => !prev.some((existing) => existing.id === p.id)
        )
        return [...prev, ...filtered]
      })

      // Si no hi ha prou productes, marcar que no hi ha més
      if (!data || data.length < perPage) setHasMore(false)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadCart()
  }, [])

  useEffect(() => {
    fetchProducts(page)
  }, [page])

  useEffect(() => {
    if (!hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 1 }
    )
    if (loader.current) observer.observe(loader.current)
    return () => {
      if (loader.current) observer.unobserve(loader.current)
    }
  }, [loading, hasMore])

  // Funció per fer scroll suau al product grid
  const scrollToProducts = () => {
    if (productsRef.current) {
      const yOffset = -50 // ajusta segons l'alçada del navbar
      const y =
        productsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-gray-900">
      {/* FONS ANIMAT */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-100 via-rose-200 to-white animate-gradient" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'url("https://www.transparenttextures.com/patterns/fabric-of-squares.png")',
        }}
      />

      {/* CONTINGUT */}
      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative text-center py-28 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://sopotey.com/blog/wp-content/uploads/2024/04/ropa-de-marca-original.jpg"
              className="w-full h-full object-cover opacity-60 transform scale-105 animate-slow-pulse"
              style={{ willChange: 'transform' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/80"></div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 drop-shadow-md animate-fade-in-down">
              Mōa
            </h1>
            <p className="mt-6 text-xl text-gray-700 animate-fade-in-up">
              Hold strong. Move free.
            </p>
            <button
              onClick={scrollToProducts} // <-- Scroll automàtic
              className="mt-8 bg-rose-600 text-white px-8 py-3 rounded-full text-lg hover:bg-rose-700 shadow-lg transition transform hover:scale-105 animate-bounce-slow"
            >
              Discover our collection
            </button>
          </div>

          <div className="absolute top-10 left-5 w-6 h-6 bg-rose-300 rounded-full opacity-50 animate-float-slow"></div>
          <div className="absolute bottom-20 right-10 w-10 h-10 bg-yellow-300 rounded-full opacity-40 animate-float-slower"></div>
        </section>

        {/* PRODUCT GRID */}
        <section ref={productsRef} className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-semibold mb-10 text-center">
            New Stuff ✨
          </h2>

          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((p, index) => (
              <li
                key={p.id}
                className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1
                  animate-fade-in ${index * 100}ms`} // <-- Fade-in amb delay per cada producte
              >
                <Link href={`/product/${p.id}`}>
                  <div className="relative cursor-pointer">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-72 object-cover rounded-t-2xl"
                      />
                    ) : (
                      <div className="w-full h-72 bg-gray-200 rounded-t-2xl" />
                    )}
                    <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs px-3 py-1 rounded-full">
                      New
                    </div>
                  </div>

                  <div className="p-5 text-center">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-gray-500 mt-2 text-sm">{p.description}</p>
                    <p className="mt-4 text-xl font-bold text-rose-700">{p.price} €</p>
                  </div>
                </Link>

                <button className="mt-4 w-full bg-rose-600 text-white py-2 rounded-full hover:bg-rose-700 transition">
                  Add to cart
                </button>
              </li>
            ))}
          </ul>

          {loading && <p className="text-center mt-10 text-gray-500">Loading more products...</p>}
          {!hasMore && (
            <p className="text-center mt-10 text-gray-400">
              No more data
            </p>
          )}
          <div ref={loader} className="h-6" />
        </section>

        {/* FOOTER */}
        <footer className="text-center py-10 border-t text-gray-600 backdrop-blur-sm bg-white/40">
          © {new Date().getFullYear()} <strong>Mōa</strong> — For women who lift more than weights.
        </footer>
      </div>
    </div>
  )
}
