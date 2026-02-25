'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

const faqData = {
  pedidos: [
    { question: "¿Cómo realizo un pedido?", answer: "Solo navega por nuestros productos, añade artículos al carrito y procede al pago. Debes crear una cuenta o iniciar sesión, luego proporcionar tus datos de envío y pago." },
    { question: "¿Puedo modificar o cancelar mi pedido?", answer: "Puedes modificar o cancelar tu pedido dentro de las 2 horas posteriores a su realización. Después de eso, el pedido entra en procesamiento y no se puede cambiar." },
    { question: "¿Qué métodos de pago aceptan?", answer: "Aceptamos tarjetas de crédito/débito principales, PayPal, Apple Pay y Google Pay." }
  ],
  envios: [
    { question: "¿Cuánto tarda el envío?", answer: "Los envíos estándar dentro de España tardan 3-5 días hábiles. Los envíos internacionales dependen del país de destino." },
    { question: "¿Ofrecen envío gratuito?", answer: "Sí, para pedidos superiores a 100€ dentro de España." },
    { question: "¿Puedo rastrear mi pedido?", answer: "Sí, recibirás un código de seguimiento por correo electrónico una vez que tu pedido sea enviado." }
  ],
  tallas: [
    { question: "¿Cómo encuentro mi talla?", answer: "Consulta nuestra Guía de Tallas donde explicamos cómo medir tu pecho y contorno." },
    { question: "¿Qué hago si estoy entre tallas?", answer: "Te recomendamos elegir la talla superior para actividades de alto impacto y la inferior para actividades de bajo impacto." }
  ],
  devoluciones: [
    { question: "¿Cuál es su política de devoluciones?", answer: "Aceptamos devoluciones dentro de los 30 días posteriores a la compra de productos sin usar y con etiquetas intactas." },
    { question: "¿Puedo devolver artículos en oferta?", answer: "Sí, salvo los productos marcados como venta final." }
  ]
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
        MOA Prova
    </div>
  )
}