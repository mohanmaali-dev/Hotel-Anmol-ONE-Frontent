import api from './axios.js'

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

export const getSaleDetails = getSale
