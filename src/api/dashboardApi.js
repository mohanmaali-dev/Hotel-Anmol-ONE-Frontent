import api from './axios.js'
import { normalizeOrder } from './orderApi.js'

const todayAsDateInput = () => {
  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

export const getDashboardData = async () => {
  const today = todayAsDateInput()
  const requests = await Promise.allSettled([
    api.get('/sales/summary'),
    api.get('/orders', { params: { fromDate: today, toDate: today, page: 1, limit: 1 } }),
    api.get('/orders', { params: { page: 1, limit: 5 } }),
    api.get('/stock/summary'),
    api.get('/stock/items', { params: { status: 'Low Stock', page: 1, limit: 5 } }),
  ])

  const successful = requests.filter((request) => request.status === 'fulfilled')
  if (!successful.length) throw requests[0].reason

  const [salesResult, todayOrdersResult, recentOrdersResult, stockResult, lowStockResult] = requests
  const sales = salesResult.status === 'fulfilled' ? salesResult.value.data.data : {}
  const todayOrdersResponse = todayOrdersResult.status === 'fulfilled' ? todayOrdersResult.value.data : {}
  const recentOrdersResponse = recentOrdersResult.status === 'fulfilled' ? recentOrdersResult.value.data : {}
  const stock = stockResult.status === 'fulfilled' ? stockResult.value.data.data : {}
  const lowStock = lowStockResult.status === 'fulfilled' ? lowStockResult.value.data.data : []
  const unavailable = requests
    .filter((request) => request.status === 'rejected')
    .map((request) => request.reason?.status)

  return {
    sales: {
      totalSales: Number(sales?.totalSales || 0),
      dueAmount: Number(sales?.dueAmount || 0),
    },
    todayOrders: Number(todayOrdersResponse.pagination?.total || 0),
    recentOrders: (recentOrdersResponse.data || []).map(normalizeOrder),
    stock: {
      totalStockItems: Number(stock?.totalStockItems || 0),
      lowStockItems: Number(stock?.lowStockItems || 0),
    },
    lowStock: lowStock.map((item) => ({
      id: item._id,
      itemName: item.itemName,
      currentStock: item.currentQuantity,
      unit: item.unit,
      status: item.status,
    })),
    hasRestrictedData: unavailable.includes(403),
    hasPartialData: requests.some((request) => request.status === 'rejected'),
  }
}
