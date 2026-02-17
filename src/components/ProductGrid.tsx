'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  type: string
  new: boolean
}

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [activeType, setActiveType] = useState<string>('Todo')
  const [loading, setLoading] = useState(true)

  // --- Fetch products ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('new', { ascending: false })
        .order('id', { ascending: false })

      if (error) {
        console.error(error)
      } else {
        setProducts(data || [])
      }

      setLoading(false)
    }

    fetchProducts()
  }, [])

  // --- Fetch types ---
  useEffect(() => {
    const fetchTypes = async () => {
      const { data, error } = await supabase.from('products').select('type')

      if (error) {
        console.error(error)
        return
      }

      const uniqueTypes = Array.from(new Set(data.map((p) => p.type))).filter(Boolean)
      setTypes(uniqueTypes)
    }

    fetchTypes()
  }, [])

  // --- Filter ---
  const filteredProducts = useMemo(() => {
    if (activeType === 'Todo') return products
    return products.filter((p) => p.type === activeType)
  }, [products, activeType])

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            Nuestra Colección
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Prendas diseñadas para acompañarte en cada movimiento
          </p>
        </div>

        {/* Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          <button
            onClick={() => setActiveType('Todo')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all border
              ${activeType === 'Todo'
                ? 'bg-rose-600 text-white border-rose-600 shadow'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
          >
            Todo
          </button>

          {types.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all border capitalize
                ${activeType === t
                  ? 'bg-rose-600 text-white border-rose-600 shadow'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Skeleton Loader */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-md animate-pulse"
              >
                <div className="w-full h-72 bg-gray-200" />

                <div className="p-5 text-center space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto" />
                  <div className="h-4 bg-gray-200 rounded w-full mx-auto" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto" />
                  <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  animation: `fadeIn 0.6s ease forwards`,
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0,
                }}
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-72 object-cover"
                  />

                  {product.new && (
                    <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs px-3 py-1 rounded-full shadow">
                      New
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-rose-700 transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  <p className="mt-4 text-xl font-bold text-rose-700">
                    {product.price.toFixed(2)} €
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filteredProducts.length === 0 && (
          <p className="text-center text-gray-500 py-20">
            No hay productos disponibles en esta categoría.
          </p>
        )}
      </div>

      {/* Animació fade */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }
      `}</style>
    </section>
  )
}

export default ProductGrid
