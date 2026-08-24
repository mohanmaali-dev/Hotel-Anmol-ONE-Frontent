import api from './axios.js'

const reportTypes = new Set(['sales', 'purchases', 'expenses', 'stock', 'payments', 'orders'])

export const getReport = async (type, filters = {}) => {
  if (!reportTypes.has(type)) throw new Error('Unknown report type')
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
  const response = await api.get(`/reports/${type}`, { params })
  return response.data
}

export const getSalesReport = (filters) => getReport('sales', filters)
export const getPurchaseReport = (filters) => getReport('purchases', filters)
export const getExpenseReport = (filters) => getReport('expenses', filters)
export const getStockReport = (filters) => getReport('stock', filters)
export const getPaymentReport = (filters) => getReport('payments', filters)
export const getOrderReport = (filters) => getReport('orders', filters)
