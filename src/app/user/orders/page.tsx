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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1️⃣ Obtenim les comandes de l'usuari
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

      // 2️⃣ Obtenim els items amb info de producte i variant
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products!inner(name, image_url),
          product_variants!inner(size)
        `)
        .in('order_id', orderIds)

      if (itemsError) {
        console.error('Error fetching order items:', itemsError)
      }

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

  if (loading) return <p className="text-center mt-10">Cargando pedidos...</p>
  if (orders.length === 0)
    return (
      <div className="text-center mt-10">
        <p className="mb-4 text-lg text-gray-700">No tienes pedidos realizados.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700 transition"
        >
          Ir a productos
        </button>
      </div>
    )

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-rose-700 text-center">Tus pedidos</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border-b border-gray-300">ID del pedido</th>
              <th className="p-3 border-b border-gray-300">Fecha</th>
              <th className="p-3 border-b border-gray-300">Importe total (€)</th>
              <th className="p-3 border-b border-gray-300">Estado</th>
              <th className="p-3 border-b border-gray-300">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 border-b border-gray-200 font-mono text-sm">{order.id}</td>
                  <td className="p-3 border-b border-gray-200">
                    {new Date(order.created_at).toLocaleString('ca-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="p-3 border-b border-gray-200">{order.total_amount.toFixed(2)}</td>
                  <td className={`p-3 border-b border-gray-200 font-medium ${
                    order.status === 'paid' ? 'text-green-600' :
                    order.status === 'pending' ? 'text-yellow-600' :
                    order.status === 'cancelled' ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    <button
                      className="text-rose-600 hover:underline"
                      onClick={() => setExpandedOrderId(prev => prev === order.id ? null : order.id)}
                    >
                      {expandedOrderId === order.id ? 'Esconder' : 'Ver'}
                    </button>
                  </td>
                </tr>

                {expandedOrderId === order.id && order.items.length > 0 && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="p-3 border-b border-gray-200">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border-b border-gray-300">Imagen</th>
                            <th className="p-2 border-b border-gray-300">Producto</th>
                            <th className="p-2 border-b border-gray-300">Talla</th>
                            <th className="p-2 border-b border-gray-300">Cantidad</th>
                            <th className="p-2 border-b border-gray-300">Precio unitario (€)</th>
                            <th className="p-2 border-b border-gray-300">Subtotal (€)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-100">
                              <td className="p-2 border-b border-gray-200">
                                <img src={item.image_url} alt={item.product_name} className="w-12 h-12 object-cover rounded" />
                              </td>
                              <td className="p-2 border-b border-gray-200 font-medium">{item.product_name}</td>
                              <td className="p-2 border-b border-gray-200">{item.size}</td>
                              <td className="p-2 border-b border-gray-200">{item.quantity}</td>
                              <td className="p-2 border-b border-gray-200">{item.unit_price.toFixed(2)}</td>
                              <td className="p-2 border-b border-gray-200">{(item.quantity * item.unit_price).toFixed(2)}</td>
                            </tr>
                          ))}
                          <tr className="font-bold bg-gray-100">
                            <td colSpan={5} className="p-2 text-right">Total (€):</td>
                            <td className="p-2">{order.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0).toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
