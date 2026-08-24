/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'

import * as authApi from '../api/authApi.js'
import { clearAuthToken, setAuthToken } from '../api/axios.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await authApi.getCurrentUser()
        setUser(result.data)
      } catch {
        clearAuthToken()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    const clearSession = () => setUser(null)
    window.addEventListener('auth:unauthorized', clearSession)
    return () => window.removeEventListener('auth:unauthorized', clearSession)
  }, [])

  const login = async (credentials) => {
    const result = await authApi.login(credentials)
    setAuthToken(result.data.token)
    setUser(result.data.user)
    return result
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Local logout must still work when the server is unavailable.
    } finally {
      clearAuthToken()
      setUser(null)
    }
  }

  const can = (module, action = 'view') => {
    if (module.toLowerCase() === 'users' && action !== 'view' && user?.role !== 'Admin') {
      return false
    }
    return Boolean(
      user?.permissions?.some(
        (permission) =>
          permission.module?.toLowerCase() === module.toLowerCase() &&
          permission.actions?.includes(action.toLowerCase()),
      ),
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
