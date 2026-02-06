'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface OrderItem {
  id: string
  product_id: string
  variant_id: string
  quantity: number
  unit_price: number
  product_name: string
  image_url: string
  size: string
}

interface Order {
  id: string
  created_at: string
  total_amount: number
  status: string
  items: OrderItem[]
}

const ORDER_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered']

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-400',
  paid: 'bg-green-500',
  processing: 'bg-blue-400',
  shipped: 'bg-indigo-400',
  delivered: 'bg-green-600',
  cancelled: 'bg-red-500',
  expired: 'bg-gray-400',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersError || !ordersData) {
        console.error('Error fetching orders:', ordersError)
        setLoading(false)
        return
      }

      const orderIds = ordersData.map(o => o.id)

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products!inner(name, image_url),
          product_variants!inner(size)
        `)
        .in('order_id', orderIds)

      if (itemsError) console.error('Error fetching order items:', itemsError)

      const ordersWithItems: Order[] = ordersData.map(order => ({
        ...order,
        items: itemsData
          ?.filter(item => item.order_id === order.id)
          .map(item => ({
            ...item,
            product_name: item.products.name,
            image_url: item.products.image_url,
            size: item.product_variants.size
          })) || []
      }))

      setOrders(ordersWithItems)
      setLoading(false)
    }

    fetchOrders()
  }, [])

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Cargando tus pedidos...</p>

  if (orders.length === 0)
    return (
      <div className="text-center mt-10">
        <p className="mb-4 text-lg text-gray-700">No tienes pedidos realizados.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-beige-600 text-white px-5 py-2 rounded-lg hover:bg-beige-700 transition"
        >
          Ir a productos
        </button>
      </div>
    )

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-3xl shadow-md">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Tus pedidos</h1>

      <div className="space-y-6">
        {orders.map(order => {
          const currentStepIndex = ORDER_STEPS.indexOf(order.status)

          return (
            <div key={order.id} className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200">
              {/* Header con info general */}
              <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100 transition"
                   onClick={() => setExpandedOrderId(prev => prev === order.id ? null : order.id)}>
                <div className="space-y-1">
                  <p className="font-mono text-sm text-gray-600">ID: {order.id}</p>
                  <p className="text-gray-700 text-sm">
                    {new Date(order.created_at).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="text-right space-y-2">
                  <p className="font-semibold text-gray-800">{order.total_amount.toFixed(2)} €</p>

                  {/* Barra de progreso con nombre de estado */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {ORDER_STEPS.map((step, i) => (
                        <div key={step} className="relative">
                          <span
                            className={`w-3 h-3 rounded-full inline-block ${i <= currentStepIndex ? STATUS_COLORS[step] : 'bg-gray-300'}`}
                            title={step.charAt(0).toUpperCase() + step.slice(1)}
                          />
                          {i < ORDER_STEPS.length - 1 && (
                            <span
                              className={`absolute top-1/2 left-3 w-8 h-1 -translate-y-1/2 ${i < currentStepIndex ? 'bg-green-400' : 'bg-gray-300'}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {ORDER_STEPS[currentStepIndex].charAt(0).toUpperCase() + ORDER_STEPS[currentStepIndex].slice(1)}
                    </p>
                  </div>
                </div>

                <button className="text-gray-700 hover:underline">
                  {expandedOrderId === order.id ? 'Esconder' : 'Ver'}
                </button>
              </div>

              {/* Items de la orden */}
              {expandedOrderId === order.id && order.items.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-gray-700">Imagen</th>
                          <th className="p-2 text-gray-700">Producto</th>
                          <th className="p-2 text-gray-700">Talla</th>
                          <th className="p-2 text-gray-700">Cantidad</th>
                          <th className="p-2 text-gray-700">Precio unitario (€)</th>
                          <th className="p-2 text-gray-700">Subtotal (€)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-2">
                              <img src={item.image_url} alt={item.product_name} className="w-12 h-12 object-cover rounded-lg" />
                            </td>
                            <td className="p-2 font-medium text-gray-800">{item.product_name}</td>
                            <td className="p-2 text-gray-700">{item.size}</td>
                            <td className="p-2 text-gray-700">{item.quantity}</td>
                            <td className="p-2 text-gray-700">{item.unit_price.toFixed(2)}</td>
                            <td className="p-2 text-gray-700">{(item.unit_price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-gray-100">
                          <td colSpan={5} className="p-2 text-right">Total (€):</td>
                          <td className="p-2 text-gray-800">{order.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
