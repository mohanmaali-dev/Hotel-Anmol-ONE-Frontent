import api from './axios.js'

export const normalizeMenuCategory = (category) => ({
  ...category,
  id: category?._id || category?.id,
  isActive: category?.status ? category.status === 'Active' : category?.isActive !== false,
})

export const normalizeMenuItem = (item) => {
  const category = item?.categoryId && typeof item.categoryId === 'object'
    ? normalizeMenuCategory(item.categoryId)
    : null

  return {
    ...item,
    id: item?._id || item?.id,
    name: item?.itemName || item?.name,
    servingSize: item?.servingSize || '',
    categoryId: category?.id || item?.categoryId,
    category,
    isAvailable: item?.availability
      ? item.availability === 'Available'
      : item?.isAvailable !== false,
    ingredients: (item?.ingredients || []).map((ingredient) => ({
      ...ingredient,
      stockItemId: ingredient.stockItemId?._id || ingredient.stockItemId,
      unit: String(ingredient.unit || '').toLowerCase(),
      stockUnit: String(ingredient.stockUnit || ingredient.unit || '').toLowerCase(),
      stockQuantityUsed: Number(ingredient.stockQuantityUsed ?? ingredient.quantityUsed),
    })),
  }
}

export const isMenuItemAvailable = (item, categories = []) => {
  const category = item.category || categories.find((entry) => entry.id === item.categoryId)
  return Boolean(item.isAvailable && (!category || category.isActive))
}

export const getMenuCategories = async (params = {}) => {
  const response = await api.get('/menu/categories', { params })
  return { ...response.data, data: (response.data.data || []).map(normalizeMenuCategory) }
}

export const getAllMenuCategories = async (params = {}) => {
  const categories = []
  let page = 1
  let pages = 1
  do {
    const result = await getMenuCategories({ ...params, page, limit: 100 })
    categories.push(...result.data)
    pages = result.pagination?.pages || 1
    page += 1
  } while (page <= pages)
  return categories
}

export const createMenuCategory = async (category) => {
  const response = await api.post('/menu/categories', {
    name: category.name,
    description: category.description,
    status: category.isActive ? 'Active' : 'Inactive',
  })
  return { ...response.data, data: normalizeMenuCategory(response.data.data) }
}

export const updateMenuCategory = async (id, category) => {
  const payload = {}
  if (category.name !== undefined) payload.name = category.name
  if (category.description !== undefined) payload.description = category.description
  if (typeof category.isActive === 'boolean') payload.status = category.isActive ? 'Active' : 'Inactive'
  else if (category.status !== undefined) payload.status = category.status
  const response = await api.put(`/menu/categories/${id}`, payload)
  return { ...response.data, data: normalizeMenuCategory(response.data.data) }
}

export const deleteMenuCategory = async (id) => {
  const response = await api.delete(`/menu/categories/${id}`)
  return response.data
}

export const getMenuItems = async (params = {}) => {
  const response = await api.get('/menu/items', { params })
  return { ...response.data, data: (response.data.data || []).map(normalizeMenuItem) }
}

export const getMenuItem = async (id) => {
  const response = await api.get(`/menu/items/${id}`)
  return { ...response.data, data: normalizeMenuItem(response.data.data) }
}

const toMenuItemPayload = (item) => {
  const payload = {}
  if (item.name !== undefined || item.itemName !== undefined) payload.itemName = item.name ?? item.itemName
  if (item.categoryId !== undefined) payload.categoryId = item.categoryId
  if (item.sellingPrice !== undefined) payload.sellingPrice = Number(item.sellingPrice)
  if (item.servingSize !== undefined) payload.servingSize = item.servingSize
  if (item.description !== undefined) payload.description = item.description
  if (typeof item.isAvailable === 'boolean') payload.availability = item.isAvailable ? 'Available' : 'Unavailable'
  else if (item.availability !== undefined) payload.availability = item.availability
  if (item.trackStock !== undefined) payload.trackStock = Boolean(item.trackStock)
  if (item.ingredients !== undefined) {
    payload.ingredients = item.trackStock === false
      ? []
      : item.ingredients.map((ingredient) => ({
        stockItemId: ingredient.stockItemId,
        quantityUsed: Number(ingredient.quantityUsed),
        unit: ingredient.unit,
      }))
  }
  return payload
}

export const createMenuItem = async (item) => {
  const response = await api.post('/menu/items', toMenuItemPayload(item))
  return { ...response.data, data: normalizeMenuItem(response.data.data) }
}

export const updateMenuItem = async (id, item) => {
  const response = await api.put(`/menu/items/${id}`, toMenuItemPayload(item))
  return { ...response.data, data: normalizeMenuItem(response.data.data) }
}

export const deleteMenuItem = async (id) => {
  const response = await api.delete(`/menu/items/${id}`)
  return response.data
}

export const getAvailableMenuItemsForOrder = async () => {
  const result = await getMenuItems({ availability: 'Available', page: 1, limit: 100 })
  return result.data
    .filter((item) => isMenuItemAvailable(item))
    .map((item) => ({ ...item, rate: Number(item.sellingPrice || 0) }))
}
