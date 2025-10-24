'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useCartStore } from '@/store/cartStore'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [variants, setVariants] = useState<any[]>([])
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const { addToCart } = useCartStore()

  useEffect(() => {
    const fetchProduct = async () => {
      console.log('Fetching product', id)

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (productError) console.error('Product error:', productError)
      else setProduct(productData)

      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id)
        .order('size', { ascending: true })

      if (variantsError) console.error('Variants error:', variantsError)
      else {
        console.log('Variants fetched:', variantsData)
        setVariants(variantsData)
        const firstInStock = variantsData.find(v => v.stock > 0)
        if (firstInStock) setSelectedSize(firstInStock.size)
      }
    }

    fetchProduct()
  }, [id])


  if (!product)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Carregant producte...
      </div>
    )

  const selectedVariant = variants.find(v => v.size === selectedSize)
  const maxQuantity = selectedVariant?.stock || 0

  return (
    <div className="relative min-h-screen text-gray-900 overflow-hidden">
      {/* FONS ANIMAT */}
      <div className="absolute inset-0">
        <img
          src={product.image_url || 'https://via.placeholder.com/1200x800'}
          alt={product.name}
          className="w-full h-full object-cover opacity-40 animate-slow-pulse"
          style={{ willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/80" />
      </div>

      {/* CONTINGUT */}
      <div className="relative z-10 max-w-6xl mx-auto py-20 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Imatge del producte */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-4">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-96 object-cover rounded-2xl"
            />
          </div>

          {/* Informació del producte */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
              <p className="mt-4 text-gray-600">{product.description}</p>
              <p className="mt-6 text-2xl font-semibold text-rose-700">
                {product.price} €
              </p>

              {/* Selecció de talla */}
              {variants.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 font-semibold">Talla:</p>
                  <div className="flex gap-2 flex-wrap">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => v.stock > 0 && setSelectedSize(v.size)}
                        className={`px-4 py-2 rounded-full border ${
                          v.stock === 0
                            ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed'
                            : selectedSize === v.size
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                        disabled={v.stock === 0}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Comptador d'unitats */}
              {selectedVariant && (
                <div className="mt-4 flex items-center gap-4">
                  <p className="font-semibold">Quantitat:</p>
                  <div className="flex items-center border rounded-full">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1 hover:bg-gray-200 rounded-l-full"
                    >
                      -
                    </button>
                    <span className="px-4">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                      className="px-3 py-1 hover:bg-gray-200 rounded-r-full"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gray-500">({maxQuantity} disponibles)</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (selectedSize && quantity > 0 && product?.id) {
                  addToCart({
                    product_id: product.id,      // <-- només id del producte
                    variant_size: selectedSize,   // <-- la talla seleccionada
                    quantity: quantity,           // <-- la quantitat
                  })
                }
              }}
              className="mt-8 bg-rose-600 text-white px-8 py-3 rounded-full text-lg hover:bg-rose-700 transition self-start disabled:opacity-50"
              disabled={!selectedSize || quantity === 0 || maxQuantity === 0}
            >
              Afegir al carrito 🛍️
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
