import api from './axios.js'

export const getSettings = async () => {
  const response = await api.get('/settings')
  return response.data
}

export const getPublicSettings = async () => {
  const response = await api.get('/settings/public')
  return response.data
}

export const updateSettings = async (settings) => {
  const response = await api.put('/settings', settings)
  return response.data
}
