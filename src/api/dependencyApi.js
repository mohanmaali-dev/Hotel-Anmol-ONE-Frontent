import api from './axios.js'

export const checkDeleteDependencies = async (type, id) => {
  const response = await api.get(`/dependencies/${type}/${id}`)
  return response.data
}
