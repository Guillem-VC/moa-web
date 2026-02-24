'use client'

import { Truck, RefreshCw, Shield, Leaf } from "lucide-react"
import { motion, Variants } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"

const features = [
  { icon: Truck, title: "Envío Gratis", description: "En pedidos superiores a 80€" },
  { icon: RefreshCw, title: "Devolución Fácil", description: "30 días para cambios" },
  { icon: Shield, title: "Pago Seguro", description: "Transacciones protegidas por Stripe" },
  { icon: Leaf, title: "Sostenible", description: "Materiales eco-friendly" },
]

// Variants per a cada item: fade
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
}

// Container amb stagger
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } } // cada item apareix 0.2s després
}

const Features = () => {
  const containerRef = useRef(null)
  const inView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <section className="py-16 bg-[#f3e9dc] border-y border-black/10">
      <div className="container mx-auto px-4">
        <motion.div
          ref={containerRef}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-10"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="text-center group"
              variants={itemVariants}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-md mb-4 group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300">
                <feature.icon className="h-6 w-6 text-rose-600" />
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Features