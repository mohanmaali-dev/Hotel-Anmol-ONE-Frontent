import api from './axios.js'
import { normalizeOrder } from './orderApi.js'

export const getDashboardData = async () => {
  const response = await api.get('/dashboard')
  const payload = response.data.data || {}

  return {
    ...payload,
    sales: payload.sales && {
      ...payload.sales,
      totalSales: Number(payload.sales.totalSales || 0),
      dueAmount: Number(payload.sales.dueAmount || 0),
    },
    purchases: payload.purchases && {
      ...payload.purchases,
      totalPurchaseAmount: Number(payload.purchases.totalPurchaseAmount || 0),
    },
    orders: payload.orders && {
      ...payload.orders,
      todayOrders: Number(payload.orders.todayOrders || 0),
      recentOrders: (payload.orders.recentOrders || []).map(normalizeOrder),
    },
    stock: payload.stock && {
      ...payload.stock,
      totalStockItems: Number(payload.stock.totalStockItems || 0),
      lowStockItems: Number(payload.stock.lowStockItems || 0),
      outOfStockItems: Number(payload.stock.outOfStockItems || 0),
      attentionItems: (payload.stock.attentionItems || []).map((item) => ({
      id: item._id,
      itemName: item.itemName,
      currentStock: item.currentQuantity,
      unit: item.unit,
      status: item.status,
      })),
    },
  }
}
