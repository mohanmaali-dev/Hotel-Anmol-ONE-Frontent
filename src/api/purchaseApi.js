import api from './axios.js'

export const normalizePurchase = (purchase) => ({
  ...purchase,
  id: purchase?._id || purchase?.id,
  invoiceNo: purchase?.supplierInvoiceNo ?? purchase?.invoiceNo ?? '',
  totalItems: (purchase?.items || []).reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  ),
  items: (purchase?.items || []).map((item) => ({
    ...item,
    itemId: item.stockItemId || item.itemId,
    name: item.itemName || item.name,
  })),
})

const toPurchasePayload = (purchase, includePayment = true) => ({
  supplierId: purchase.supplierId,
  purchaseDate: purchase.purchaseDate,
  supplierInvoiceNo: purchase.supplierInvoiceNo ?? purchase.invoiceNo,
  notes: purchase.notes,
  discount: Number(purchase.discount || 0),
  additionalCharges: Number(purchase.additionalCharges || 0),
  paymentType: purchase.paymentType || null,
  ...(includePayment ? { paidAmount: Number(purchase.paidAmount || 0) } : {}),
  ...(purchase.purchaseStatus ? { purchaseStatus: purchase.purchaseStatus } : {}),
  items: purchase.items?.map((item) => ({
    stockItemId: item.stockItemId || item.itemId,
    itemName: item.itemName || item.name,
    quantity: Number(item.quantity),
    unit: item.unit,
    purchasePrice: Number(item.purchasePrice),
  })),
})

export const getPurchases = async (params = {}) => {
  const response = await api.get('/purchases', { params })
  return {
    ...response.data,
    data: (response.data.data || []).map(normalizePurchase),
  }
}

export const getPurchase = async (id) => {
  const response = await api.get(`/purchases/${id}`)
  return { ...response.data, data: normalizePurchase(response.data.data) }
}

export const createPurchase = async (purchase) => {
  const response = await api.post('/purchases', toPurchasePayload(purchase))
  return { ...response.data, data: normalizePurchase(response.data.data) }
}

export const updatePurchase = async (id, purchase) => {
  const response = await api.put(`/purchases/${id}`, toPurchasePayload(purchase, false))
  return { ...response.data, data: normalizePurchase(response.data.data) }
}

export const updatePurchaseStatus = async (id, purchaseStatus) => {
  const response = await api.put(`/purchases/${id}/status`, { purchaseStatus })
  return { ...response.data, data: normalizePurchase(response.data.data) }
}

export const updatePurchasePayment = async (id, payment) => {
  const response = await api.put(`/purchases/${id}/payment`, {
    paidAmount: Number(payment.paidAmount),
    paymentType: payment.paymentType,
  })
  return { ...response.data, data: normalizePurchase(response.data.data) }
}

export const deletePurchase = async (id) => {
  const response = await api.delete(`/purchases/${id}`)
  return response.data
}
