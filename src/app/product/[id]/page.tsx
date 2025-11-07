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
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [showImage, setShowImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [zoomed, setZoomed] = useState(false)


  useEffect(() => {
    if (selectedSize != null) setQuantity(1)
  }, [selectedSize])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const [{ data: prod }, { data: vars }, { data: imgs }] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('product_variants').select('*').eq('product_id', id).order('size'),
        supabase.from('product_images').select('image_url').eq('product_id', id).order('position', { ascending: true }),
      ])
      console.log('🔍 product_id:', id)
      console.log('📸 Imatges trobades:', imgs)

      if (prod) {
        // Si hi ha files a product_images, agafa les seves URLs
        if (imgs && imgs.length > 0) {
          prod.image_urls = imgs.map((i: any) => i.image_url)
        } 
        // Si no, manté la imatge antiga
        
        else if (prod.image_url) {
          prod.image_urls = [prod.image_url]
        }
        setProduct(prod)
      }

      if (vars) {
        setVariants(vars)
        const firstInStock = vars.find((v) => v.stock > 0)
        if (firstInStock) setSelectedSize(firstInStock.size)
      }

      setLoading(false)
    }

    if (id) fetchData()
  }, [id])



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

    if (error) {
      alert('Error al desar la notificació.')
    } else {
      alert('T’avisarem quan torni l’estoc 👌')
      setActiveTooltip(null)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-rose-100 to-white">
        <img src="/gos.gif" alt="Carregant..." className="w-24 h-auto opacity-80" />
      </div>
    )

  if (!product)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        No s’ha trobat el producte.
      </div>
    )

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 text-gray-900">
      <div className="max-w-6xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Imatge principal */}
        <div className="relative group">
          <div
            onClick={() => setShowImage(true)}
            className="overflow-hidden rounded-3xl shadow-xl cursor-zoom-in"
          >
            <img
              src={product?.image_urls?.[selectedImage]}
              alt={product.name}
              className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {/*
          <div className="absolute -bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm text-gray-700 shadow">
            Espai per escriure algo
          </div>
          */}
          {/* Miniatures en horitzontal */}
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
            {product.image_urls.map((url: string, i: number) => (
              <img
                key={i}
                src={url}
                onClick={() => setSelectedImage(i)}
                className={`w-24 h-24 object-cover rounded-xl cursor-pointer transition-transform duration-200 hover:scale-105 ${
                  selectedImage === i
                    ? 'ring-0 ring-black/80'
                    : 'opacity-60 hover:opacity-100'
                }`}
                alt={`${product.name} ${i + 1}`}
              />
            ))}
          </div>

          {/* 🔍 Modal d'ampliació */}
          {showImage && (
            <div
              onClick={() => setShowImage(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 cursor-pointer animate-fadeIn"
            >
              {/* Fletxa esquerra */}
              {selectedImage > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage((prev) => Math.max(0, prev - 1))
                  }}
                  className="absolute left-6 text-white text-4xl p-2 rounded-full bg-black/40 hover:bg-black/60 transition"
                >
                  ❮
                </button>
              )}

              {/* Contenidor de la imatge */}
              <div
                className="relative"
                onClick={(e) => {
                  e.stopPropagation()
                  setZoomed((z) => !z)
                }}
              >
                <img
                  src={product.image_urls[selectedImage]}
                  alt={product.name}
                  className={`max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain transition-transform duration-300 ${
                    zoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                  }`}
                />
              </div>

              {/* Fletxa dreta */}
              {selectedImage < product.image_urls.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage((prev) =>
                      Math.min(product.image_urls.length - 1, prev + 1)
                    )
                  }}
                  className="absolute right-6 text-white text-4xl p-2 rounded-full bg-black/40 hover:bg-black/60 transition"
                >
                  ❯
                </button>
              )}

              {/* Botó tancar */}
              <button
                onClick={() => setShowImage(false)}
                className="absolute top-6 right-6 text-white text-3xl bg-black/40 hover:bg-black/60 rounded-full px-3 pb-1 transition"
              >
                ✕
              </button>
            </div>
          )}

        </div>
        {/* Info */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-8">
          <h1 className="text-4xl font-extrabold tracking-tight">{product.name}</h1>
          <p className="mt-3 text-gray-600 leading-relaxed">{product.description}</p>
          <p className="mt-6 text-3xl font-semibold text-rose-600">{product.price} €</p>

          {/* Talles */}
          <div className="mt-6">
            <p className="font-semibold mb-2">Talla</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <div key={v.id} className="relative">
                  <button
                    onClick={() =>
                      v.stock === 0
                        ? setActiveTooltip(activeTooltip === v.id ? null : v.id)
                        : setSelectedSize(v.size)
                    }
                    className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 ${
                      v.stock === 0
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-pointer'
                        : selectedSize === v.size
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-rose-100'
                    }`}
                  >
                    {v.size}
                  </button>

                  {/* Tooltip */}
                  {activeTooltip === v.id && (
                    <div
                      ref={tooltipRef}
                      className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-center z-20 w-56 animate-fadeIn"
                    >
                      <p className="text-sm text-gray-700 mb-2">Talla esgotada 😞</p>
                      <button
                        onClick={() => handleNotifyMe(v)}
                        className="bg-rose-600 text-white px-4 py-1.5 rounded-full text-sm hover:bg-rose-700 transition"
                      >
                        Avísame 📩
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quantitat */}
          {selectedVariant && (
            <div className="mt-6 flex items-center gap-3">
              <p className="font-semibold">Quantitat:</p>
              <div className="flex items-center border rounded-full overflow-hidden shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  className="px-3 py-1.5 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <span className="text-gray-500 text-sm">({maxQuantity} disponibles)</span>
            </div>
          )}

          {/* Botó afegir */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || quantity === 0 || maxQuantity === 0 || adding}
            className="mt-8 w-full bg-gradient-to-r from-rose-600 to-pink-500 text-white py-3 rounded-full text-lg font-semibold hover:scale-[1.02] active:scale-95 transition-transform shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {adding ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Afegint...
              </>
            ) : (
              'Afegir al carrito 🛍️'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
