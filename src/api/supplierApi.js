import api from './axios.js'
import { fetchAllPages } from './fetchAllPages.js'

export const normalizeSupplier = (supplier) => ({
  ...supplier,
  id: supplier?._id || supplier?.id,
  name: supplier?.supplierName || supplier?.name,
  gstTaxNo: supplier?.gstTaxNumber ?? supplier?.gstTaxNo ?? '',
  isActive: supplier?.status ? supplier.status === 'Active' : supplier?.isActive !== false,
  totalPurchases: Number(supplier?.purchaseSummary?.totalPurchases || supplier?.totalPurchases || 0),
  totalPurchaseAmount: Number(supplier?.purchaseSummary?.totalPurchaseAmount || supplier?.totalPurchaseAmount || 0),
  totalPaid: Number(supplier?.purchaseSummary?.totalPaid || supplier?.totalPaid || 0),
  totalDue: Number(supplier?.purchaseSummary?.totalDue || supplier?.totalDue || 0),
  lastPurchaseDate: supplier?.purchaseSummary?.lastPurchaseDate || supplier?.lastPurchaseDate || null,
})

export const normalizeSupplierDetails = (payload) => {
  const supplier = normalizeSupplier(payload.supplier || payload)
  const summary = payload.purchaseSummary || {}
  return {
    ...supplier,
    totalPurchases: Number(summary.totalPurchases || 0),
    totalPurchaseAmount: Number(summary.totalPurchaseAmount || 0),
    totalPaid: Number(summary.totalPaid || 0),
    totalDue: Number(summary.totalDue || 0),
    lastPurchaseDate: summary.lastPurchaseDate || null,
    purchaseHistory: (payload.purchaseHistory || []).map((purchase) => ({
      ...purchase,
      id: purchase._id || purchase.id,
    })),
  }
}

export const getSuppliers = async (params = {}) => {
  const response = await api.get('/suppliers', { params })
  const suppliers = (response.data.data || []).map(normalizeSupplier)

  return { ...response.data, data: suppliers }
}

export const getAllSuppliers = (params = {}) => fetchAllPages(getSuppliers, params)

export const getSupplier = async (id, purchaseLimit = 10) => {
  const response = await api.get(`/suppliers/${id}`, { params: { purchaseLimit } })
  return { ...response.data, data: normalizeSupplierDetails(response.data.data) }
}

const toSupplierPayload = (supplier) => ({
  supplierName: supplier.name || supplier.supplierName,
  contactPerson: supplier.contactPerson,
  phone: supplier.phone,
  alternatePhone: supplier.alternatePhone,
  email: supplier.email,
  address: supplier.address,
  gstTaxNumber: supplier.gstTaxNo ?? supplier.gstTaxNumber,
  notes: supplier.notes,
  status:
    typeof supplier.isActive === 'boolean'
      ? supplier.isActive ? 'Active' : 'Inactive'
      : supplier.status,
})

export const createSupplier = async (supplier) => {
  const response = await api.post('/suppliers', toSupplierPayload(supplier))
  return { ...response.data, data: normalizeSupplier(response.data.data) }
}

export const updateSupplier = async (id, supplier) => {
  const response = await api.put(`/suppliers/${id}`, toSupplierPayload(supplier))
  return { ...response.data, data: normalizeSupplier(response.data.data) }
}

export const deleteSupplier = async (id) => {
  const response = await api.delete(`/suppliers/${id}`)
  return response.data
}
