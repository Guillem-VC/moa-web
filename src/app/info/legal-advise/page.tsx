'use client'

import Link from 'next/link'

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 text-gray-800">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-rose-700 mb-8">
          Aviso Legal y Política de Privacidad
        </h1>

        <div className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto space-y-10 text-left">

          <div>
            <h2 className="text-2xl font-semibold text-rose-700 mb-3">
              1. Responsable del tratamiento
            </h2>
            <p>
              El responsable de los datos es Cynthia Fernandez Masip (MOA). Los datos personales recopilados,
              como tu correo electrónico, se usarán únicamente para fines relacionados con nuestra actividad:
              envío de información, promociones y novedades.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-rose-700 mb-3">
              2. Datos que recogemos
            </h2>
            <p>Recogemos únicamente los datos que tú nos facilitas voluntariamente:</p>
            <ul className="list-disc pl-6 mt-3">
              <li>Correo electrónico</li>
              <li>Nombre (opcional)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-rose-700 mb-3">
              3. Finalidad del tratamiento
            </h2>
            <p>Tus datos se utilizarán para:</p>
            <ul className="list-disc pl-6 mt-3">
              <li>Enviar boletines informativos y comunicaciones sobre nuestros productos y servicios.</li>
              <li>Informarte de novedades y promociones.</li>
              <li>Gestionar la suscripción y garantizar la seguridad de nuestros servicios.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-rose-700 mb-3">
              4. Base legal
            </h2>
            <p>
              El tratamiento de tus datos se realiza con tu consentimiento explícito al suscribirte en nuestra web.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-rose-700 mb-3">
              5. Conservación de los datos
            </h2>
            <p>
              Tus datos se conservarán mientras mantengas tu suscripción o hasta que solicites su eliminación.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-rose-700 mb-3">
              6. Derechos de los usuarios
            </h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc pl-6 mt-3">
              <li>Acceder a tus datos.</li>
              <li>Rectificarlos si son incorrectos.</li>
              <li>Solicitar su supresión (“derecho al olvido”).</li>
              <li>Limitar u oponerte al tratamiento.</li>
              <li>Solicitar la portabilidad de tus datos.</li>
            </ul>

            <p className="mt-4">
              Para ejercer tus derechos, puedes escribir a:{' '}
              <span className="font-semibold text-gray-800">
                contact.moasport@gmail.com
              </span>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-rose-700 mb-3">
              7. Seguridad
            </h2>
            <p>
              Adoptamos las medidas técnicas y organizativas necesarias para proteger tus datos frente a accesos
              no autorizados, pérdidas o alteraciones.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-rose-700 mb-3">
              8. Cookies
            </h2>
            <p>
              Nuestra web puede usar cookies para mejorar tu experiencia y analizar estadísticas de visitas.
              Consulta nuestra política de cookies para más detalles.
            </p>
          </div>

        </div>

        <Link
          href="/"
          className="inline-block mt-12 bg-rose-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-rose-700 transition"
        >
          Volver al inicio
        </Link>
      </section>
    </div>
  )
}
