/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { getPublicSettings } from '../api/settingsApi.js'
import { defaultSettings, mergeSettings } from '../data/settingsDefaults.js'
import { useAuth } from './AuthContext.jsx'
import { setDefaultCurrency } from '../utils/orderFormatters.js'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [loadedUserId, setLoadedUserId] = useState('')
  setDefaultCurrency(settings.restaurant.currency)

  const refreshSettings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const result = await getPublicSettings()
      setSettings(mergeSettings(result.data))
    } catch {
      // Keep safe display defaults if settings cannot be loaded.
    } finally {
      setLoading(false)
      setLoadedUserId(String(user?._id || ''))
    }
  }, [user])

  useEffect(() => {
    if (user) refreshSettings()
    else {
      setSettings(defaultSettings)
      setLoadedUserId('')
    }
  }, [user, refreshSettings])

  const waitingForUserSettings = Boolean(user && loadedUserId !== String(user._id))

  return (
    <SettingsContext.Provider value={{ settings, setSettings, loading, refreshSettings }}>
      {waitingForUserSettings ? <div className="grid min-h-screen place-items-center bg-cream"><span className="size-10 animate-spin rounded-full border-4 border-primary-light border-t-primary" /></div> : children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
