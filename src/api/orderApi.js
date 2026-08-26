import api from './axios.js'

export const normalizeOrder = (order) => ({
  ...order,
  id: order?._id || order?.id,
  bill: order?.bill
    ? { ...order.bill, id: order.bill._id || order.bill.id }
    : null,
  billerName: order?.biller?.name || '',
  items: (order?.items || []).map((item) => ({
    ...item,
    id: item._id || item.id,
    name: item.itemName || item.name,
  })),
})

const toOrderPayload = (order) => ({
  date: order.date,
  orderType: order.orderType,
  areaType: order.areaType,
  areaRoomNo: order.areaRoomNo,
  customerName: order.customerName,
  biller: order.biller || null,
  discount: Number(order.discount || 0),
  additionalCharges: Number(order.additionalCharges || 0),
  paymentType: order.paymentType,
  paymentStatus: order.paymentStatus,
  ...(order.orderStatus ? { orderStatus: order.orderStatus } : {}),
  items: order.items?.map((item) => ({
    menuItemId: item.menuItemId,
    itemName: item.itemName || item.name,
    quantity: Number(item.quantity),
    rate: Number(item.rate),
  })),
})

export const getOrders = async (params = {}) => {
  const response = await api.get('/orders', { params })
  return {
    ...response.data,
    data: (response.data.data || []).map(normalizeOrder),
  }
}

export const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}`)
  return { ...response.data, data: normalizeOrder(response.data.data) }
}

export const createOrder = async (order) => {
  const response = await api.post('/orders', toOrderPayload(order))
  return { ...response.data, data: normalizeOrder(response.data.data) }
}

export const updateOrder = async (id, order) => {
  const payload = order.items ? toOrderPayload(order) : order
  const response = await api.put(`/orders/${id}`, payload)
  return { ...response.data, data: normalizeOrder(response.data.data) }
}

export const deleteOrder = async (id) => {
  const response = await api.delete(`/orders/${id}`)
  return response.data
}
