'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 text-gray-800">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-rose-700 mb-8">
          Sobre Mōa
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          A <strong>Mōa</strong> creiem en la força, la llibertat i l’autenticitat. 
          Som una marca creada per dones que aixequen molt més que pes — aixequen 
          objectius, reptes i somnis. Cada peça està pensada per combinar estil, 
          rendiment i comoditat, perquè et sentis bé tant dins com fora del gimnàs.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
          Tots els nostres productes estan dissenyats amb materials sostenibles 
          i un compromís ferm amb la qualitat i el respecte pel medi ambient. 
          Acompanyem la teva evolució, moviment a moviment.
        </p>

        <Link
          href="/"
          className="inline-block mt-8 bg-rose-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-rose-700 transition"
        >
          Tornar a l’inici
        </Link>
      </section>

      <footer className="text-center py-10 border-t text-gray-600 backdrop-blur-sm bg-white/40">
        © {new Date().getFullYear()} <strong>Mōa</strong> — Creada per dones fortes.
      </footer>
    </div>
  )
}
