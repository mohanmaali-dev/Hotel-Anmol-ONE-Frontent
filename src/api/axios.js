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
    this.dependencies = options.dependencies || []
  }
}

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

let refreshRequest = null

const refreshAccessToken = () => {
  if (!refreshRequest) {
    refreshRequest = axios
      .post(`${apiUrl}/auth/refresh`, {}, {
        withCredentials: true,
        timeout: 15000,
        headers: { Accept: 'application/json' },
      })
      .then((response) => {
        const token = response.data?.data?.token
        if (!token) throw new Error('The server did not return a new access token')
        setAuthToken(token)
        return token
      })
      .finally(() => {
        refreshRequest = null
      })
  }
  return refreshRequest
}

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const requestUrl = String(originalRequest?.url || '')
    const canRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._sessionRetry &&
      !requestUrl.includes('/auth/login') &&
      !requestUrl.includes('/auth/refresh')

    let finalError = error
    if (canRefresh) {
      originalRequest._sessionRetry = true
      try {
        const token = await refreshAccessToken()
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        finalError = refreshError
        const refreshStatus = refreshError.response?.status
        if ([400, 401, 403].includes(refreshStatus)) {
          clearAuthToken()
          window.dispatchEvent(new CustomEvent('auth:unauthorized'))
        }
      }
    }

    const status = finalError.response?.status
    const body = finalError.response?.data

    if (status === 401 && !requestUrl.includes('/auth/login')) {
      clearAuthToken()
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    let message = body?.message
    if (!finalError.response) message = 'Unable to reach the server. Check your connection and try again.'
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
        dependencies: body?.dependencies,
      }),
    )
  },
)

export default api
