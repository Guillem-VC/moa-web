'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'

export default function Home() {
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true) // 👈 comença en mode "carregant"
  const [filterType, setFilterType] = useState<string>('Todo')
  const [types, setTypes] = useState<string[]>([])
  const productsRef = useRef<HTMLElement>(null)
  const { loadCart } = useCartStore()

  const filteredProducts = useMemo(() => {
    if (filterType === 'Todo') return allProducts
    return allProducts.filter((p) => p.type === filterType)
  }, [allProducts, filterType])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('new', { ascending: false })
      .order('id', { ascending: false })

    if (error) console.error(error)
    else setAllProducts(data || [])
  }

  const fetchTypes = async () => {
    const { data, error } = await supabase.from('products').select('type')
    if (error) console.error(error)
    else {
      const uniqueTypes = Array.from(new Set(data.map((p) => p.type))).filter(Boolean)
      setTypes(uniqueTypes)
    }
  }

  const handleFilterChange = (type: string) => {
    setFilterType(type)
    if (productsRef.current && window.scrollY < productsRef.current.offsetTop - 100) {
      const yOffset = -80
      const y = productsRef.current.getBoundingClientRect().top + window.scrollY + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const guestCart = localStorage.getItem('cart_items')
        if (guestCart) {
          const guestItems = JSON.parse(guestCart)
          for (const item of guestItems) {
            await useCartStore.getState().addToCart(item)
          }
          localStorage.removeItem('cart_items')
        }
        await useCartStore.getState().syncCartWithSupabase()
      } else {
        const guestCart = localStorage.getItem('cart_items')
        if (guestCart) {
          const guestItems = JSON.parse(guestCart)
          guestItems.forEach((item: any) => useCartStore.getState().addToCart(item))
        }
      }

      await fetchTypes()
      await fetchProducts()

      // ✅ quan tot ha carregat
      setLoading(false)
    }

    init()
  }, [])

  // 🔹 Si encara estem carregant, mostra només el loader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        {/* 👇 aquí poses el teu .gif */}
        <img
          src="/gos.gif" // guarda el teu gif dins /public
          alt="Carregant..."
          className="w-20 sm:w-24 md:w-32 lg:w-40 h-auto"
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-gray-900">
      {/* FONS */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-100 via-rose-200 to-white" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/fabric-of-squares.png")',
        }}
      />

      <div className="relative z-10">
        {/* HERO */}
        <section className="relative text-center py-28 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://sopotey.com/blog/wp-content/uploads/2024/04/ropa-de-marca-original.jpg"
              className="w-full h-full object-cover opacity-60 transform scale-105 animate-slow-pulse"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/80"></div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-6xl font-extrabold text-gray-900 drop-shadow-md">Mōa</h1>
            <p className="mt-6 text-xl text-gray-700">Hold strong. Move free.</p>
            <button
              onClick={() => {
                if (productsRef.current) {
                  const yOffset = -120
                  const y = productsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
                  window.scrollTo({ top: y, behavior: 'smooth' })
                }
              }}
              className="mt-8 bg-rose-600 text-white px-8 py-3 rounded-full text-lg hover:bg-rose-700 shadow-lg transition transform hover:scale-105"
            >
              Nuestra colección
            </button>
          </div>
        </section>

        {/* FILTRES */}
        <section className="text-center mt-6">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleFilterChange('Todo')}
              className={`px-4 py-2 rounded-full border ${
                filterType === 'Todo'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todo
            </button>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => handleFilterChange(t)}
                className={`px-4 py-2 rounded-full border capitalize ${
                  filterType === t
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* PRODUCTES */}
        <section ref={productsRef} className="max-w-7xl mx-auto px-6 py-8">
        {/*<h2 className="text-3xl font-semibold mb-10 text-center">New Stuff ✨</h2>*/}

          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 transition-opacity duration-200">
            {filteredProducts.map((p) => (
              <li
                key={p.id}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <Link href={`/product/${p.id}`}>
                  <div className="relative cursor-pointer">
                    <img
                      src={p.image_url || 'https://via.placeholder.com/300'}
                      alt={p.name}
                      className="w-full h-72 object-cover rounded-t-2xl"
                    />
                    {p.new && (
                      <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs px-3 py-1 rounded-full">
                        New
                      </div>
                    )}
                  </div>

                  <div className="p-5 text-center">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-gray-500 mt-2 text-sm">{p.description}</p>
                    <p className="mt-4 text-xl font-bold text-rose-700">{p.price} €</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <footer className="text-center py-10 border-t text-gray-600 backdrop-blur-sm bg-white/40">
          © {new Date().getFullYear()} <strong>Mōa</strong> — For women who lift more than weights.
        </footer>
      </div>
    </div>
  )
}
