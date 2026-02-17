'use client'

import Link from 'next/link'

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 text-gray-800">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-rose-700 mb-8">
          Envíos
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          Los pedidos se preparan y envían en un plazo de 24–72 horas laborables desde la confirmación de compra 
          (salvo periodos especiales o lanzamientos). Una vez enviado, el tiempo de entrega dependerá de la empresa logística seleccionada.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          Ten en cuenta que pueden producirse retrasos ajenos a MOA debido a incidencias de transporte, 
          periodos de alta demanda o circunstancias externas. En caso de cualquier problema, te ayudaremos a gestionarlo lo antes posible.
        </p>

        <h1 className="text-5xl font-bold text-rose-700 mb-8">
          Devoluciones
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-6">
          Para que la devolución sea aceptada:
        </p>

        <div className="max-w-3xl mx-auto mb-10 space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            1. La prenda debe estar sin usar.
          </h2>
          <h2 className="text-2xl font-semibold text-gray-900">
            2. Debe conservar etiquetas y embalaje original.
          </h2>
          <h2 className="text-2xl font-semibold text-gray-900">
            3. No debe presentar daños ni signos de uso.
          </h2>
        </div>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          Una vez recibamos el producto y verifiquemos su estado, se realizará el reembolso mediante el mismo método de pago utilizado en la compra.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          Para solicitar un cambio o devolución, puedes contactar con nosotros a través del correo de atención al cliente indicando tu número de pedido.
        </p>
        
        <Link
          href="/"
          className="inline-block mt-8 bg-rose-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-rose-700 transition"
        >
          Volver al inicio
        </Link>
      </section>
    </div>
  )
}
