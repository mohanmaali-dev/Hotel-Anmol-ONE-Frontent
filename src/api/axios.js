import axios from 'axios'

const TOKEN_KEY = 'restaurant_access_token'
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const apiUrl = configuredApiUrl ? configuredApiUrl.replace(/\/+$/, '') : '/api'

export const getAuthToken = () => sessionStorage.getItem(TOKEN_KEY)

export const setAuthToken = (token) => {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export const clearAuthToken = () => sessionStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.errors = options.errors || []
    this.items = options.items || []
  }
}

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const body = error.response?.data

    if (status === 401) {
      clearAuthToken()
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    let message = body?.message
    if (!error.response) message = 'Unable to reach the server. Check your connection and try again.'
    if (!message) message = 'Something went wrong. Please try again.'

    if (Array.isArray(body?.errors) && body.errors.length) {
      message = `${message}: ${body.errors.join(', ')}`
    }

    if (Array.isArray(body?.items) && body.items.length) {
      const details = body.items
        .map((item) => `${item.item}: required ${item.required}, available ${item.available}`)
        .join('; ')
      message = `${message}. ${details}`
    }

    return Promise.reject(
      new ApiError(message, {
        status,
        errors: body?.errors,
        items: body?.items,
      }),
    )
  },
)

export default api
