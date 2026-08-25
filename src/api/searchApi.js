import api from './axios.js'

export const searchAll = async (query) => {
  const response = await api.get('/search', { params: { q: query } })
  return response.data.data || []
}
