import { permissionsArrayToMap, permissionsMapToArray } from '../data/permissionOptions.js'
import api from './axios.js'

export const normalizeUser = (user) => ({
  ...user,
  id: user?._id || user?.id,
  fullName: user?.name || user?.fullName || '',
  isActive: user?.status ? user.status === 'Active' : user?.isActive !== false,
  permissionList: user?.permissions || [],
  permissions: permissionsArrayToMap(user?.permissions),
})

const toPayload = (user) => ({
  fullName: user.fullName,
  username: user.username,
  email: user.email || undefined,
  phone: user.phone,
  role: user.role,
  status: user.isActive ? 'Active' : 'Inactive',
  permissions: permissionsMapToArray(user.permissions),
  ...(user.password ? { password: user.password, confirmPassword: user.confirmPassword } : {}),
})

export const getUsers = async (params = {}) => {
  const response = await api.get('/users', { params })
  return { ...response.data, data: (response.data.data || []).map(normalizeUser) }
}

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}`)
  return { ...response.data, data: normalizeUser(response.data.data) }
}

export const createUser = async (user) => {
  const response = await api.post('/users', toPayload(user))
  return { ...response.data, data: normalizeUser(response.data.data) }
}

export const updateUser = async (id, user) => {
  const response = await api.patch(`/users/${id}`, toPayload(user))
  return { ...response.data, data: normalizeUser(response.data.data) }
}

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`)
  return response.data
}
