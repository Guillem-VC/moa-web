'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useCartStore } from '@/store/cartStore'
import { Loader2 } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [variants, setVariants] = useState<any[]>([])
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const { addToCart } = useCartStore()

  // 🔹 Referència global per al tooltip actiu
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (selectedSize != null) setQuantity(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSize])


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [{ data: prod }, { data: vars }] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('product_variants').select('*').eq('product_id', id).order('size'),
      ])
      if (prod) setProduct(prod)
      if (vars) {
        setVariants(vars)
        const firstInStock = vars.find((v) => v.stock > 0)
        if (firstInStock) setSelectedSize(firstInStock.size)
      }
      setLoading(false)
    }
    if (id) fetchData()
  }, [id])

  // 🔹 Detectar clic fora del tooltip
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setActiveTooltip(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedVariant = variants.find((v) => v.size === selectedSize)
  const maxQuantity = selectedVariant?.stock || 0

  const handleAddToCart = async () => {
    if (!selectedSize || quantity <= 0 || !product?.id) return
    setAdding(true)
    await addToCart({
      product_id: product.id,
      variant_size: selectedSize,
      quantity,
    })
    setAdding(false)
  }

  const handleNotifyMe = async (variant: any) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.email) return router.push('/login')
    const email = session.user.email
    const { error } = await supabase.from('stock_notifications').insert([
      { product_id: product.id, variant_id: variant.id, user_email: email },
    ])
    if (error) alert('Error al desar la notificació.')
    else alert('T’avisarem quan torni l’estoc 👌')
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <img src="/gos.gif" alt="Carregant..." className="w-24 h-auto opacity-80" />
      </div>
    )

  if (!product)
    return <div className="flex items-center justify-center min-h-screen text-gray-600">
      No s’ha trobat el producte.
    </div>

  return (
    <div className="relative min-h-screen text-gray-900 overflow-hidden">
      {/* Fons */}
      <div className="absolute inset-0">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/80" />
      </div>

      {/* Contingut */}
      <div className="relative z-10 max-w-6xl mx-auto py-20 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Imatge */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-4">
            <img src={product.image_url} alt={product.name} className="w-full h-96 object-cover rounded-2xl" />
          </div>

          {/* Dades */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8">
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p className="mt-4 text-gray-600">{product.description}</p>
            <p className="mt-6 text-2xl font-semibold text-rose-700">{product.price} €</p>

            {/* Talles */}
            <div className="mt-6">
              <p className="mb-2 font-semibold">Talla:</p>
              <div className="flex gap-2 flex-wrap relative">
                {variants.map((v) => (
                  <div key={v.id} className="relative">
                    <button
                      onClick={() =>
                        v.stock === 0
                          ? setActiveTooltip(activeTooltip === v.id ? null : v.id)
                          : setSelectedSize(v.size)
                      }
                      className={`px-4 py-2 rounded-full border transition-all ${
                        v.stock === 0
                          ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-pointer'
                          : selectedSize === v.size
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {v.size}
                    </button>

                    {/* Tooltip si no hi ha stock */}
                    {activeTooltip === v.id && (
                      <div
                        ref={tooltipRef}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-center z-20 w-56"
                      >
                        <p className="text-sm text-gray-700 mb-2">Aquesta talla està esgotada.</p>
                        <button
                          onClick={() => handleNotifyMe(v)}
                          className="bg-rose-600 text-white px-4 py-1.5 rounded-full text-sm hover:bg-rose-700 transition"
                        >
                          Avísame quan torni 📩
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quantitat i carrito */}
            {selectedVariant && (
              <div className="mt-5 flex items-center gap-4">
                <p className="font-semibold">Quantitat:</p>
                <div className="flex items-center border rounded-full">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-1 hover:bg-gray-200 rounded-l-full">-</button>
                  <span className="px-4">{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))} className="px-3 py-1 hover:bg-gray-200 rounded-r-full">+</button>
                </div>
                <span className="text-gray-500">({maxQuantity} disponibles)</span>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || quantity === 0 || maxQuantity === 0 || adding}
              className="mt-8 bg-rose-600 text-white px-8 py-3 rounded-full text-lg hover:bg-rose-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {adding ? <><Loader2 className="animate-spin w-5 h-5" /> Afegint...</> : 'Afegir al carrito 🛍️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
