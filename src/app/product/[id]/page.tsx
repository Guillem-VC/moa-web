'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useCartStore } from '@/store/cartStore'
import { Loader2, Heart, Truck, ShieldCheck } from 'lucide-react'
import { FaCcVisa, FaCcMastercard, FaPaypal, FaApplePay } from "react-icons/fa";
import { useUIStore } from '@/store/uiStore'

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

  const openCart = useUIStore((s) => s.openCart)

  /* ─────────────────────────────
      DADES DERIVADES
  ───────────────────────────── */

  const selectedVariant = useMemo(
    () => variants.find(v => v.size === selectedSize),
    [variants, selectedSize]
  )

  const isOutOfStock = (selectedVariant?.stock ?? 0) <= 0
  const isLowStock =
    (selectedVariant?.stock ?? 0) > 0 &&
    (selectedVariant?.stock ?? 0) <= 3

  /* ─────────────────────────────
      FETCH PRODUCTE
  ───────────────────────────── */

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

  /* ─────────────────────────────
      REALTIME STOCK
  ───────────────────────────── */

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

  /* ─────────────────────────────
      RESET QUANTITAT
  ───────────────────────────── */

  useEffect(() => {
    setQuantity(1)
  }, [selectedSize])

  /* ─────────────────────────────
      TOOLTIP CLICK OUTSIDE
  ───────────────────────────── */

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setActiveTooltip(null)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ─────────────────────────────
      ACTIONS
  ───────────────────────────── */

  const handleAddToCart = async () => {
    if (!product || !selectedSize || isOutOfStock) return
    setAdding(true)

    await addToCart({
      product_id: product.id,
      variant_size: selectedSize,
      quantity,
    })
    openCart()

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
    alert('Te avisaremos cuando vuelva a haver stock 👌')
  }

  /* ─────────────────────────────
      LOADING
  ───────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <img src="/gos.gif" className="w-20 opacity-80" />
          <p className="text-gray-500 text-sm">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 bg-white">
        No se ha encontrado el producto.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      {/* MODAL IMATGE */}
      {showImage && (
        <div
          onClick={() => setShowImage(false)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <img
            src={product.image_urls[selectedImage]}
            alt={product.name}
            className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl object-contain"
          />
        </div>
      )}

      {/* PAGE */}
      <section className="py-14 bg-[#f3e9dc] border-b border-black/10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
              {product.type || 'Producte'}
            </p>

            <h1 className="font-display text-4xl md:text-5xl font-semibold text-gray-900">
              {product.name}
            </h1>

            <p className="mt-4 text-gray-600 max-w-xl mx-auto">
              {product.description}
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* IMATGES */}
            <div>
              <div
                onClick={() => setShowImage(true)}
                className="rounded-3xl overflow-hidden shadow-lg border border-black/10 cursor-zoom-in bg-white"
              >
                <img
                  src={product.image_urls[selectedImage]}
                  alt={product.name}
                  className="w-full h-[520px] object-cover"
                />
              </div>

              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.image_urls.map((url: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`rounded-2xl overflow-hidden border transition-all shrink-0 ${
                      selectedImage === i
                        ? 'border-rose-600 shadow-md'
                        : 'border-black/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={url}
                      className="w-24 h-24 object-cover"
                      alt={`image-${i}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* INFO CARD */}
            <div className="bg-white rounded-3xl shadow-lg border border-black/10 p-8">

              {/* PRICE */}
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-3xl font-semibold text-gray-900">
                    {product.price.toFixed(2)} €
                  </p>

                  {isLowStock && !isOutOfStock && (
                    <p className="mt-2 text-sm text-orange-600 font-medium">
                      Últimas unidades!
                    </p>
                  )}

                  {isOutOfStock && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      Agotado temporalmente
                    </p>
                  )}
                </div>

                <button className="w-11 h-11 rounded-full border border-black/10 flex items-center justify-center hover:bg-gray-50 transition">
                  <Heart className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* DIVIDER */}
              <div className="my-8 h-px bg-black/10" />

              {/* TALLES */}
              <div>
                <p className="font-semibold text-gray-900 mb-3">Selección de talla</p>

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
                          className={`px-5 py-2 rounded-full border text-sm font-medium transition-all ${
                            vOutOfStock
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                              : selectedSize === v.size
                              ? 'bg-rose-600 text-white border-rose-600 shadow'
                              : 'bg-white text-gray-800 border-black/10 hover:bg-gray-50'
                          }`}
                        >
                          {v.size}
                        </button>

                        {/* TOOLTIP */}
                        {activeTooltip === v.id && (
                          <div
                            ref={tooltipRef}
                            className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white border border-black/10 rounded-2xl shadow-xl p-4 text-center z-20 w-60"
                          >
                            <p className="text-sm text-gray-700 mb-3">
                              Esta talla está agotada, disculpe las molestias 😞
                            </p>

                            <button
                              onClick={() => handleNotifyMe(v)}
                              className="w-full bg-rose-600 text-white py-2 rounded-full text-sm font-medium hover:bg-rose-700 transition"
                            >
                              Avísame cuando haya stock
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
                <div className="mt-8 flex items-center justify-between gap-4">
                  <p className="font-semibold text-gray-900">Cantidad: </p>

                  <div className="flex items-center border border-black/10 rounded-full overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className={`px-4 py-2 text-lg font-semibold transition ${
                        quantity <= 1 || isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      −
                    </button>

                    <span className="px-5 font-medium text-gray-900">
                      {quantity}
                    </span>

                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      disabled={isOutOfStock}
                      className={`px-4 py-2 text-lg font-semibold transition ${
                        isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || isOutOfStock || adding}
                className="mt-10 w-full bg-rose-600 text-white py-3.5 rounded-full font-semibold text-base flex justify-center items-center gap-2 hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Añadiendo...
                  </>
                ) : (
                  'Afegir al carrito'
                )}
              </button>

              {/* INFO STRIPE STYLE */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                
                <div className="flex items-center gap-2 bg-gray-50 border border-black/10 rounded-2xl p-4">
                  <Truck className="w-5 h-5 text-gray-700" />
                  <span>Envío en 24/48h</span>
                </div>

                <div className="flex flex-col gap-2 bg-gray-50 border border-black/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-gray-700" />
                    <span>Pago seguro</span>
                  </div>

                  <div className="flex items-center gap-3 text-2xl text-gray-600 opacity-80">
                    <FaCcVisa />
                    <FaCcMastercard />
                    <FaPaypal />
                    <FaApplePay />
                  </div>
                </div>

              </div>

              {/* SMALL NOTE */}
              <p className="mt-6 text-xs text-gray-500 leading-relaxed">
                Els colors poden variar lleugerament segons la pantalla. Stock actualitzat en temps real.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
