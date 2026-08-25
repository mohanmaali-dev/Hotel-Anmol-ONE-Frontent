import api from './axios.js'
import { getOrder } from './orderApi.js'

export const normalizeBill = (bill) => ({
  ...bill,
  id: bill?._id || bill?.id,
  billerName: bill?.biller?.name || bill?.billerName || '',
  items: (bill?.items || []).map((item) => ({
    ...item,
    id: item._id || item.id,
    name: item.itemName || item.name,
  })),
})

export const getBills = async (params = {}) => {
  const response = await api.get('/bills', { params })
  return {
    ...response.data,
    data: (response.data.data || []).map(normalizeBill),
  }
}

export const getBill = async (id) => {
  const response = await api.get(`/bills/${id}`)
  return { ...response.data, data: normalizeBill(response.data.data) }
}

export const getBillDetails = async (id) => {
  const result = await getBill(id)
  try {
    const orderResult = await getOrder(result.data.orderId)
    return {
      ...result,
      data: {
        ...result.data,
        areaType: orderResult.data.areaType,
        areaRoomNo: orderResult.data.areaRoomNo,
        billerName: result.data.billerName || orderResult.data.billerName,
      },
    }
  } catch {
    return result
  }
}

export const generateBillFromOrder = async (orderId, payment = {}) => {
  const response = await api.post(`/bills/from-order/${orderId}`, payment)
  return { ...response.data, data: normalizeBill(response.data.data) }
}

export const updateBillPayment = async (id, payment) => {
  const response = await api.put(`/bills/${id}/payment`, {
    paidAmount: Number(payment.paidAmount),
    paymentType: payment.paymentType,
    reason: payment.reason,
  })
  return { ...response.data, data: normalizeBill(response.data.data) }
}

export const findBillForOrder = async (orderNo) => {
  const result = await getBills({ search: orderNo, page: 1, limit: 20 })
  return result.data.find((bill) => bill.orderNo === orderNo) || null
}
