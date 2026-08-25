import api from './axios.js'

export const normalizeStockCategory = (category) => ({
  ...category,
  id: category?._id || category?.id,
  isActive: category?.status ? category.status === 'Active' : category?.isActive !== false,
})

export const normalizeStockItem = (item) => ({
  ...item,
  id: item?._id || item?.id,
  name: item?.itemName || item?.name,
  stockValue: Number(item?.stockValue ?? Number(item?.currentQuantity || 0) * Number(item?.purchasePrice || 0)),
})

export const normalizeStockMovement = (movement) => ({
  ...movement,
  id: movement?._id || movement?.id,
  itemId: movement?.stockItemId || movement?.itemId,
  supplierId: movement?.supplierId?._id || movement?.supplierId || '',
  supplierName: movement?.supplierId?.name || movement?.supplierName || '',
  purchaseId: movement?.purchaseId?._id || movement?.purchaseId || '',
  type: movement?.type === 'IN' ? 'Stock In' : 'Stock Out',
  previousStock: movement?.previousQuantity ?? movement?.previousStock,
  newStock: movement?.newQuantity ?? movement?.newStock,
  userName: movement?.user?.name || '',
  reference:
    movement?.reference ||
    (movement?.purchaseId ? `Purchase ${movement.purchaseId}` : '') ||
    (movement?.orderId ? `Order ${movement.orderId}` : '') ||
    '—',
})

export const getStockCategories = async (params = {}) => {
  const response = await api.get('/stock/categories', { params })
  return { ...response.data, data: (response.data.data || []).map(normalizeStockCategory) }
}

export const createStockCategory = async (category) => {
  const response = await api.post('/stock/categories', {
    name: category.name,
    status: category.isActive === false ? 'Inactive' : 'Active',
  })
  return { ...response.data, data: normalizeStockCategory(response.data.data) }
}

export const updateStockCategory = async (id, category) => {
  const response = await api.put(`/stock/categories/${id}`, {
    ...(category.name !== undefined ? { name: category.name } : {}),
    ...(category.isActive !== undefined ? { status: category.isActive ? 'Active' : 'Inactive' } : {}),
  })
  return { ...response.data, data: normalizeStockCategory(response.data.data) }
}

export const deleteStockCategory = async (id) => {
  const response = await api.delete(`/stock/categories/${id}`)
  return response.data
}

export const getStockItems = async (params = {}) => {
  const response = await api.get('/stock/items', { params })
  return {
    ...response.data,
    data: (response.data.data || []).map(normalizeStockItem),
  }
}

export const getStockItem = async (id) => {
  const response = await api.get(`/stock/items/${id}`)
  return { ...response.data, data: normalizeStockItem(response.data.data) }
}

export const createStockItem = async (item) => {
  const response = await api.post('/stock/items', {
    itemName: item.name || item.itemName,
    category: item.category,
    unit: item.unit,
    openingQuantity: Number(item.currentQuantity ?? item.openingQuantity ?? 0),
    purchasePrice: Number(item.purchasePrice || 0),
    minimumStock: Number(item.minimumStock || 0),
    supplierId: item.supplierId || null,
  })
  return { ...response.data, data: normalizeStockItem(response.data.data) }
}

export const updateStockItem = async (id, item) => {
  const response = await api.put(`/stock/items/${id}`, {
    itemName: item.name || item.itemName,
    category: item.category,
    unit: item.unit,
    purchasePrice: Number(item.purchasePrice || 0),
    minimumStock: Number(item.minimumStock || 0),
    supplierId: item.supplierId || null,
  })
  return { ...response.data, data: normalizeStockItem(response.data.data) }
}

export const deleteStockItem = async (id) => {
  const response = await api.delete(`/stock/items/${id}`)
  return response.data
}

export const stockIn = async (movement) => {
  const response = await api.post('/stock/in', {
    stockItemId: movement.itemId || movement.stockItemId,
    quantity: Number(movement.quantity),
    purchasePrice: Number(movement.purchasePrice),
    supplierId: movement.supplierId || null,
    purchaseId: movement.purchaseId || null,
    reference: movement.reference,
    date: movement.date,
    note: movement.note,
  })
  return {
    ...response.data,
    data: {
      item: normalizeStockItem(response.data.data.item),
      history: normalizeStockMovement(response.data.data.history),
    },
  }
}

export const stockOut = async (movement) => {
  const response = await api.post('/stock/out', {
    stockItemId: movement.itemId || movement.stockItemId,
    quantity: Number(movement.quantity),
    reason: movement.reason,
    reference: movement.reference,
    date: movement.date,
    note: movement.note,
  })
  return {
    ...response.data,
    data: {
      item: normalizeStockItem(response.data.data.item),
      history: normalizeStockMovement(response.data.data.history),
    },
  }
}

export const getStockHistory = async (params = {}) => {
  const response = await api.get('/stock/history', { params })
  return {
    ...response.data,
    data: (response.data.data || []).map(normalizeStockMovement),
  }
}

export const getStockSummary = async () => {
  const response = await api.get('/stock/summary')
  return response.data
}
