import { useEffect, useState } from 'react'
import { FiDatabase, FiSave, FiSettings } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { getSettings, updateSettings } from '../api/settingsApi.js'
import BillingSettings from '../components/settings/BillingSettings.jsx'
import OrderSettings from '../components/settings/OrderSettings.jsx'
import RestaurantSettings from '../components/settings/RestaurantSettings.jsx'
import StockSettings from '../components/settings/StockSettings.jsx'
import Toast from '../components/Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { mergeSettings } from '../data/settingsDefaults.js'

function Settings() {
  const { can } = useAuth()
  const { setSettings: setGlobalSettings, refreshSettings } = useSettings()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    getSettings().then((result) => setSettings(mergeSettings(result.data))).catch((error) => setMessage({ type: 'error', text: error.message })).finally(() => setLoading(false))
  }, [])

  const updateSection = (section, field, value) => setSettings((current) => ({ ...current, [section]: { ...current[section], [field]: value } }))

  const handleSave = async () => {
    if (!settings.restaurant.name.trim() || !settings.restaurant.phone.trim()) {
      setMessage({ type: 'error', text: 'Please enter the restaurant name and phone number.' }); return
    }
    const restaurantPhone = settings.restaurant.phone.replace(/\D/g, '')
    if (restaurantPhone.length < 7 || restaurantPhone.length > 15) {
      setMessage({ type: 'error', text: 'Phone number must contain 7 to 15 digits.' }); return
    }
    const normalized = mergeSettings({ ...settings, restaurant: { ...settings.restaurant, phone: restaurantPhone }, billing: { ...settings.billing, taxPercentage: Math.max(0, Math.min(100, Number(settings.billing.taxPercentage) || 0)), defaultAdditionalCharge: Math.max(0, Number(settings.billing.defaultAdditionalCharge) || 0) }, stock: { ...settings.stock, defaultMinimumStock: Math.max(0, Number(settings.stock.defaultMinimumStock) || 0) } })
    setSaving(true)
    try {
      const result = await updateSettings(normalized)
      const saved = mergeSettings(result.data)
      setSettings(saved); setGlobalSettings(saved); await refreshSettings()
      setMessage({ type: 'success', text: 'Settings saved successfully.' })
    } catch (error) { setMessage({ type: 'error', text: error.message }) } finally { setSaving(false) }
  }

  if (loading) return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /></main>
  if (!settings) return <main className="px-4 py-12 text-center text-sm text-rose-600">{message?.text || 'Unable to load settings.'}</main>

  return <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
    <Toast message={message?.text} type={message?.type} onClose={() => setMessage(null)} />
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary-dark">RESTAURANT SETTINGS</p><div className="mt-1 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiSettings /></span></div><p className="mt-1 text-sm text-slate-500">Manage restaurant, billing, order, and stock defaults.</p></div><Link to="/excel" className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"><FiDatabase /> Excel Import / Export</Link></div>
    <div className="space-y-5"><RestaurantSettings settings={settings.restaurant} onChange={(field, value) => updateSection('restaurant', field, value)} /><BillingSettings settings={settings.billing} onChange={(field, value) => updateSection('billing', field, value)} /><OrderSettings settings={settings.order} onChange={(field, value) => updateSection('order', field, value)} /><StockSettings settings={settings.stock} onChange={(field, value) => updateSection('stock', field, value)} /></div>
    {can('settings', 'edit') && <div className="sticky bottom-0 mt-6 flex justify-end border-t border-slate-200 bg-cream/95 py-4 backdrop-blur"><button type="button" disabled={saving} onClick={handleSave} className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-60"><FiSave /> {saving ? 'Saving...' : 'Save Settings'}</button></div>}
  </div></main>
}

export default Settings
