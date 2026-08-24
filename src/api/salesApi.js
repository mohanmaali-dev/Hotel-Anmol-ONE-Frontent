import api from './axios.js'
import { getBill } from './billingApi.js'
import { getOrder } from './orderApi.js'

export const normalizeSale = (sale) => ({
  ...sale,
  id: sale?._id || sale?.id,
  billerName: sale?.biller?.name || sale?.billerName || '',
  items: (sale?.items || []).map((item) => ({
    ...item,
    id: item._id || item.id,
    name: item.itemName || item.name,
  })),
})

export const getSales = async (params = {}) => {
  const response = await api.get('/sales', { params })
  return {
    ...response.data,
    data: (response.data.data || []).map(normalizeSale),
  }
}

export const getSalesSummary = async () => {
  const response = await api.get('/sales/summary')
  return response.data
}

export const getSale = async (id) => {
  const response = await api.get(`/sales/${id}`)
  return { ...response.data, data: normalizeSale(response.data.data) }
}

export const getSaleDetails = async (id) => {
  const saleResult = await getSale(id)
  const sale = saleResult.data
  const [billResult, orderResult] = await Promise.allSettled([
    getBill(sale.billId),
    getOrder(sale.orderId),
  ])
  const bill = billResult.status === 'fulfilled' ? billResult.value.data : {}
  const order = orderResult.status === 'fulfilled' ? orderResult.value.data : {}

  return {
    ...saleResult,
    data: normalizeSale({
      ...bill,
      ...order,
      ...sale,
      _id: sale._id,
      items: bill.items || order.items || [],
      areaType: order.areaType,
      areaRoomNo: order.areaRoomNo,
      subtotal: bill.subtotal,
      discount: bill.discount,
      additionalCharges: bill.additionalCharges,
      billerName: sale.billerName || bill.billerName || order.billerName,
    }),
  }
}
