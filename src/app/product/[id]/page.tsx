'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useCartStore } from '@/store/cartStore'
import { Loader2, Heart, Truck, ShieldCheck } from 'lucide-react'
import { FaCcVisa, FaCcMastercard, FaPaypal, FaApplePay } from "react-icons/fa";
import { useUIStore } from '@/store/uiStore'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"


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

  //popup
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [showPrivacyText, setShowPrivacyText] = useState(false)

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

  //popup
  useEffect(() => {
    const alreadyClosed = localStorage.getItem('newsletter_popup_closed')
    if (alreadyClosed === 'true') return

    const timer = setTimeout(() => {
      setShowNewsletterPopup(true)
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showImage) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowImage(false)
      if (e.key === "ArrowRight") goNextImage()
      if (e.key === "ArrowLeft") goPrevImage()
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [showImage, product])



  /* ─────────────────────────────
      ACTIONS
  ───────────────────────────── */

  const goNextImage = () => {
    setSelectedImage((prev) =>
      prev + 1 >= product.image_urls.length ? 0 : prev + 1
    )
  }

  const goPrevImage = () => {
    setSelectedImage((prev) =>
      prev - 1 < 0 ? product.image_urls.length - 1 : prev - 1
    )
  }


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

  //function to close popup
  const closeNewsletterPopup = () => {
    localStorage.setItem('newsletter_popup_closed', 'true')
    setShowNewsletterPopup(false)
  }

  //function to send email to supabase
  const handleNewsletterSubmit = async () => {
    const email = newsletterEmail.toLowerCase().trim()

    if (!email || !email.includes("@")) {
      alert("Email no válido")
      return
    }

    if (!privacyAccepted) {
      alert("Debes aceptar la política de privacidad")
      return
    }

    setNewsletterLoading(true)

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const json = await res.json()

    setNewsletterLoading(false)

    if (!json.ok) {
      console.error(json)
      alert("Error saving mail")
      return
    }

    if (json.alreadySubscribed) {
      alert("This email is already subscribed 👌")
      closeNewsletterPopup()
      return
    }

    alert("Gracias por suscribirte 🎉")
    closeNewsletterPopup()
  }




  /* ─────────────────────────────
      LOADING
  ───────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          {/*<img src="/gos.gif" className="w-20 opacity-80" />*/}
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
      {/*POPUP*/}
      {showNewsletterPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative border border-black/10">
            
            <button
              onClick={closeNewsletterPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold text-gray-900">
              ¿Te gusta este top? 😊
            </h2>

            <p className="text-sm text-gray-600 mt-2">
              Estamos haciendo una prueba rápida para saber si este producto tendría interés.
              Si te gusta y te gustaría saber cuándo estará disponible, déjanos tu correo y te avisaremos en cuanto haya novedades.
              ¡Gracias por ayudarnos! 💛
            </p>

            <div className="mt-6 space-y-3">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                className="w-full border border-black/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              {/* CHECKBOX PRIVACIDAD */}
              <div className="flex items-start gap-3 text-sm text-gray-600 mt-2">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1"
                />

                <div className="leading-snug">
                  <span>
                    Acepto recibir información y doy mi consentimiento según el{" "}
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowPrivacyText(!showPrivacyText)}
                    className="text-rose-600 font-medium hover:underline"
                  >
                    Aviso Legal y Política de Privacidad
                  </button>
                </div>
              </div>

              {/* TEXTO PRIVACIDAD DESPLEGABLE */}
              {showPrivacyText && (
                <div className="bg-gray-50 border border-black/10 rounded-2xl p-4 text-xs text-gray-700 max-h-52 overflow-y-auto">
                  <p className="font-semibold mb-2">Aviso Legal y Política de Privacidad de MOA</p>

                  <p className="font-semibold mt-2">1. Responsable del tratamiento</p>
                  <p>
                    El responsable de los datos es Cynthia Fernandez Masip (MOA). Los datos personales recopilados,
                    como tu correo electrónico, se usarán únicamente para fines relacionados con nuestra actividad:
                    envío de información, promociones y novedades.
                  </p>

                  <p className="font-semibold mt-2">2. Datos que recogemos</p>
                  <p>
                    Recogemos únicamente los datos que tú nos facilitas voluntariamente:
                    <br />- Correo electrónico
                    <br />- Nombre (opcional)
                  </p>

                  <p className="font-semibold mt-2">3. Finalidad del tratamiento</p>
                  <p>
                    Tus datos se utilizarán para:
                    <br />- Enviar boletines informativos y comunicaciones sobre nuestros productos y servicios.
                    <br />- Informarte de novedades y promociones.
                    <br />- Gestionar la suscripción y garantizar la seguridad de nuestros servicios.
                  </p>

                  <p className="font-semibold mt-2">4. Base legal</p>
                  <p>
                    El tratamiento de tus datos se realiza con tu consentimiento explícito al suscribirte en nuestra web.
                  </p>

                  <p className="font-semibold mt-2">5. Conservación de los datos</p>
                  <p>
                    Tus datos se conservarán mientras mantengas tu suscripción o hasta que solicites su eliminación.
                  </p>

                  <p className="font-semibold mt-2">6. Derechos de los usuarios</p>
                  <p>
                    Tienes derecho a:
                    <br />- Acceder a tus datos.
                    <br />- Rectificarlos si son incorrectos.
                    <br />- Solicitar su supresión (“derecho al olvido”).
                    <br />- Limitar u oponerte al tratamiento.
                    <br />- Solicitar la portabilidad de tus datos.
                    <br />
                    <br />
                    Para ejercer tus derechos, puedes escribir a:{" "}
                    <span className="font-medium">contact.moasport@gmail.com</span>
                  </p>

                  <p className="font-semibold mt-2">7. Seguridad</p>
                  <p>
                    Adoptamos las medidas técnicas y organizativas necesarias para proteger tus datos frente a accesos
                    no autorizados, pérdidas o alteraciones.
                  </p>

                  <p className="font-semibold mt-2">8. Cookies</p>
                  <p>
                    Nuestra web puede usar cookies para mejorar tu experiencia y analizar estadísticas de visitas.
                    Consulta nuestra política de cookies para más detalles.
                  </p>
                </div>
              )}

              <button
                onClick={handleNewsletterSubmit}
                disabled={newsletterLoading || !privacyAccepted}
                className="w-full bg-rose-600 text-white py-3 rounded-full font-semibold hover:bg-rose-700 transition disabled:opacity-50"
              >
                {newsletterLoading ? 'Enviando...' : 'Suscribirme'}
              </button>

              <button
                onClick={closeNewsletterPopup}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                No, gracias
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMATGE */}
      {showImage && (
        <div
          onClick={() => setShowImage(false)}
          className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
        >
          {/* CLOSE */}
          <button
            onClick={() => setShowImage(false)}
            className="absolute top-5 right-5 text-white text-3xl z-50"
          >
            ✕
          </button>

          {/* LEFT / RIGHT */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrevImage(); }}
            className="absolute left-3 text-white text-5xl z-50 opacity-80 hover:opacity-100 transition"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNextImage(); }}
            className="absolute right-3 text-white text-5xl z-50 opacity-80 hover:opacity-100 transition"
          >
            ›
          </button>

          {/* TRANSFORM FULLSCREEN */}
          <TransformWrapper
            key={selectedImage}
            initialScale={1}     // escala inicial natural (ja plena pantalla)
            minScale={1}         // no permet fer zoom out per quedar més petit
            maxScale={5}         // permet zoom molt gran
            centerOnInit
            doubleClick={{ mode: "zoomIn" }}
            wheel={{ step: 0.2 }}
            pinch={{ step: 0.5 }}
            panning={{ velocityDisabled: true }}
          >
            <TransformComponent
              wrapperClass="fixed inset-0 flex items-center justify-center overflow-visible z-50"
              contentClass="flex items-center justify-center"
            >
              <img
                src={product.image_urls[selectedImage]}
                alt={product.name}
                className="w-screen h-screen object-contain select-none"
                draggable={false}
              />
            </TransformComponent>
          </TransformWrapper>

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
                  'Añadir al carrito'
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
                Los colores pueden variar ligeramente segun la pantalla. Stock actualitzado en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
