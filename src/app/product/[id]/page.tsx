'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useCartStore } from '@/store/cartStore'
import { Loader2 } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const router = useRouter()
  const { addToCart } = useCartStore()
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const [product, setProduct] = useState<any>(null)
  const [variants, setVariants] = useState<any[]>([])
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const [selectedImage, setSelectedImage] = useState(0)
  const [showImage, setShowImage] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  /* ──────────────────────
     DADES DERIVADES
  ────────────────────── */

  const selectedVariant = useMemo(
    () => variants.find(v => v.size === selectedSize),
    [variants, selectedSize]
  )

  const isOutOfStock = (selectedVariant?.stock ?? 0) <= 0
  const isLowStock =
    (selectedVariant?.stock ?? 0) > 0 &&
    (selectedVariant?.stock ?? 0) <= 3

  /* ──────────────────────
     FETCH INICIAL
  ────────────────────── */

  useEffect(() => {
    if (!id) return

    const load = async () => {
      setLoading(true)

      const [{ data: prod }, { data: vars }, { data: imgs }] =
        await Promise.all([
          supabase.from('products').select('*').eq('id', id).single(),
          supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', id)
            .order('size'),
          supabase
            .from('product_images')
            .select('image_url')
            .eq('product_id', id)
            .order('position'),
        ])

      if (prod) {
        prod.image_urls =
          imgs?.map((i: any) => i.image_url) ||
          (prod.image_url ? [prod.image_url] : [])
        setProduct(prod)
      }

      if (vars) {
        setVariants(vars)
        const firstInStock = vars.find(v => v.stock > 0)
        if (firstInStock) setSelectedSize(firstInStock.size)
      }

      setLoading(false)
    }

    load()
  }, [id])

  /* ──────────────────────
     REALTIME STOCK
  ────────────────────── */

  useEffect(() => {
    if (!id) return

    const channel = supabase
      .channel('product-stock')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'product_variants',
          filter: `product_id=eq.${id}`,
        },
        payload => {
          setVariants(prev =>
            prev.map(v =>
              v.id === payload.new.id
                ? { ...v, stock: payload.new.stock }
                : v
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  /* ──────────────────────
     RESET QUANTITAT
  ────────────────────── */

  useEffect(() => {
    setQuantity(1)
  }, [selectedSize])

  /* ──────────────────────
     TOOLTIP OUTSIDE
  ────────────────────── */

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setActiveTooltip(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ──────────────────────
     ACTIONS
  ────────────────────── */

  const handleAddToCart = async () => {
    if (!product || !selectedSize || isOutOfStock) return
    setAdding(true)

    await addToCart({
      product_id: product.id,
      variant_size: selectedSize,
      quantity,
    })

    setAdding(false)
  }

  const handleNotifyMe = async (variant: any) => {
    const { data } = await supabase.auth.getSession()
    if (!data.session?.user?.email) return router.push('/signin')

    await supabase.from('stock_notifications').insert({
      product_id: product.id,
      variant_id: variant.id,
      user_email: data.session.user.email,
    })

    setActiveTooltip(null)
    alert('T’avisarem quan torni l’estoc 👌')
  }

  /* ──────────────────────
     RENDER
  ────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <img src="/gos.gif" className="w-24 opacity-80" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        No s’ha trobat el producte.
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 text-gray-900">
      <div className="max-w-6xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

        {/* IMATGES */}
        <div className="relative">
          <div
            onClick={() => setShowImage(true)}
            className="overflow-hidden rounded-3xl shadow-xl cursor-zoom-in"
          >
            <img
              src={product.image_urls[selectedImage]}
              alt={product.name}
              className="w-full h-[500px] object-cover"
            />
          </div>

          <div className="flex gap-3 mt-4 overflow-x-auto">
            {product.image_urls.map((url: string, i: number) => (
              <img
                key={i}
                src={url}
                onClick={() => setSelectedImage(i)}
                className={`w-24 h-24 object-cover rounded-xl cursor-pointer ${
                  selectedImage === i ? 'opacity-100' : 'opacity-60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-8">
          <h1 className="text-4xl font-extrabold">{product.name}</h1>
          <p className="mt-3 text-gray-600">{product.description}</p>
          <p className="mt-6 text-3xl font-semibold text-rose-600">
            {product.price} €
          </p>

          {/* TALLES */}
          <div className="mt-6">
            <p className="font-semibold mb-2">Talla</p>
            <div className="flex flex-wrap gap-2">
              {variants.map(v => {
                const vOutOfStock = v.stock <= 0

                return (
                  <div key={v.id} className="relative">
                    <button
                      onClick={() =>
                        vOutOfStock
                          ? setActiveTooltip(activeTooltip === v.id ? null : v.id)
                          : setSelectedSize(v.size)
                      }
                      className={`px-4 py-2 rounded-full border text-sm ${
                        vOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : selectedSize === v.size
                          ? 'bg-rose-600 text-white'
                          : 'bg-white hover:bg-rose-100'
                      }`}
                    >
                      {v.size}
                    </button>

                    {activeTooltip === v.id && (
                      <div
                        ref={tooltipRef}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border rounded-xl shadow-lg p-3 text-center z-20 w-56"
                      >
                        <p className="text-sm mb-2">Talla esgotada 😞</p>
                        <button
                          onClick={() => handleNotifyMe(v)}
                          className="bg-rose-600 text-white px-4 py-1.5 rounded-full text-sm"
                        >
                          Avísame
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* QUANTITAT */}
          {selectedVariant && (
            <div className="mt-6 flex items-center gap-3">
              <p className="font-semibold">Quantitat:</p>

              <div className="flex items-center border rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className={`px-3 py-1.5 ${
                    quantity <= 1 || isOutOfStock
                      ? 'bg-gray-300'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  -
                </button>

                <span className="px-4 font-medium">{quantity}</span>

                <button
                  onClick={() => setQuantity(q => q + 1)}
                  disabled={isOutOfStock}
                  className={`px-3 py-1.5 ${
                    isOutOfStock ? 'bg-gray-300' : 'hover:bg-gray-100'
                  }`}
                >
                  +
                </button>
              </div>

              {isOutOfStock && (
                <span className="text-red-600 text-sm">Esgotat</span>
              )}

              {isLowStock && (
                <span className="text-orange-600 text-sm">
                  Últimes unitats
                </span>
              )}
            </div>
          )}

          {/* AFEGIR */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || isOutOfStock || adding}
            className="mt-8 w-full bg-gradient-to-r from-rose-600 to-pink-500 text-white py-3 rounded-full font-semibold flex justify-center gap-2 disabled:opacity-50"
          >
            {adding ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Afegint...
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
