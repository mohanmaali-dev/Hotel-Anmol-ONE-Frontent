/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { getPublicSettings } from '../api/settingsApi.js'
import { defaultSettings, mergeSettings } from '../data/settingsDefaults.js'
import { useAuth } from './AuthContext.jsx'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(false)

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
    }
  }, [user])

  useEffect(() => {
    if (user) refreshSettings()
    else setSettings(defaultSettings)
  }, [user, refreshSettings])

  return (
    <SettingsContext.Provider value={{ settings, setSettings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
