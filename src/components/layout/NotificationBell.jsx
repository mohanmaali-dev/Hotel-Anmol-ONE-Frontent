import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiAlertTriangle, FiBell, FiCreditCard, FiPackage, FiRefreshCw } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import { getSalesSummary } from '../../api/salesApi.js'
import { getStockSummary } from '../../api/stockApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'
import { formatCurrency } from '../../utils/orderFormatters.js'

const emptyAlerts = { dueAmount: 0, lowStockItems: 0, outOfStockItems: 0 }

function NotificationBell() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const { can } = useAuth()
  const { settings } = useSettings()
  const canViewSales = can('sales', 'view')
  const canViewStock = can('stock', 'view')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [alerts, setAlerts] = useState(emptyAlerts)

  const loadAlerts = useCallback(async () => {
    if (!canViewSales && !canViewStock) return
    setLoading(true)
    setError('')

    const [salesResult, stockResult] = await Promise.allSettled([
      canViewSales ? getSalesSummary() : Promise.resolve(null),
      canViewStock ? getStockSummary() : Promise.resolve(null),
    ])

    const allAvailableRequestsFailed =
      (!canViewSales || salesResult.status === 'rejected') &&
      (!canViewStock || stockResult.status === 'rejected')

    if (allAvailableRequestsFailed) {
      setError('Alerts could not be loaded.')
      setLoading(false)
      return
    }

    const sales = salesResult.status === 'fulfilled' ? salesResult.value?.data : null
    const stock = stockResult.status === 'fulfilled' ? stockResult.value?.data : null
    setAlerts({
      dueAmount: Number(sales?.dueAmount || 0),
      lowStockItems: Number(stock?.lowStockItems || 0),
      outOfStockItems: Number(stock?.outOfStockItems || 0),
    })
    setLoading(false)
  }, [canViewSales, canViewStock])

  useEffect(() => {
    loadAlerts()
    const timer = window.setInterval(loadAlerts, 60000)
    return () => window.clearInterval(timer)
  }, [loadAlerts])

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  const notifications = useMemo(() => {
    const items = []
    if (canViewStock && alerts.outOfStockItems > 0) items.push({ id: 'out-stock', title: `${alerts.outOfStockItems} item${alerts.outOfStockItems === 1 ? '' : 's'} out of stock`, detail: 'Restock these items as soon as possible.', icon: FiPackage, color: 'bg-rose-50 text-rose-600', path: '/stock' })
    if (canViewStock && settings.stock.lowStockAlertEnabled && alerts.lowStockItems > 0) items.push({ id: 'low-stock', title: `${alerts.lowStockItems} item${alerts.lowStockItems === 1 ? '' : 's'} running low`, detail: 'Check stock before it runs out.', icon: FiAlertTriangle, color: 'bg-amber-50 text-amber-600', path: '/stock' })
    if (canViewSales && alerts.dueAmount > 0) items.push({ id: 'due-payment', title: `${formatCurrency(alerts.dueAmount, settings.restaurant.currency)} payment due`, detail: 'Open Billing to review unpaid bills.', icon: FiCreditCard, color: 'bg-blue-50 text-blue-600', path: '/billing' })
    return items
  }, [alerts, canViewSales, canViewStock, settings.restaurant.currency, settings.stock.lowStockAlertEnabled])

  const openNotification = (path) => {
    setOpen(false)
    navigate(path)
  }

  if (!canViewSales && !canViewStock) return null

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((current) => !current); if (!open) loadAlerts() }}
        aria-label={notifications.length ? `Notifications, ${notifications.length} items need attention` : 'Notifications'}
        aria-expanded={open}
        className={`relative grid size-10 place-items-center rounded-lg border transition ${open ? 'border-primary bg-primary-light text-primary-dark' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
      >
        <FiBell className="text-lg" />
        {notifications.length > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-bold leading-4 text-white">{notifications.length}</span>}
      </button>

      {open && (
        <section className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div><h2 className="text-sm font-bold text-slate-900">Needs Attention</h2><p className="mt-0.5 text-xs text-slate-500">Live restaurant alerts</p></div>
            <button type="button" onClick={loadAlerts} disabled={loading} title="Refresh alerts" aria-label="Refresh alerts" className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-primary-dark disabled:opacity-50"><FiRefreshCw className={loading ? 'animate-spin' : ''} /></button>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {loading && !notifications.length && <div className="px-3 py-8 text-center text-sm text-slate-500">Checking for alerts...</div>}
            {!loading && error && <div className="px-3 py-8 text-center"><p className="text-sm font-medium text-rose-600">{error}</p><button type="button" onClick={loadAlerts} className="mt-2 text-xs font-semibold text-primary-dark">Try again</button></div>}
            {!loading && !error && !notifications.length && <div className="px-3 py-8 text-center"><span className="mx-auto grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-600"><FiBell /></span><p className="mt-3 text-sm font-semibold text-slate-700">Nothing needs attention</p><p className="mt-1 text-xs text-slate-500">You are all caught up.</p></div>}
            {notifications.map(({ id, title, detail, icon: Icon, color, path }) => (
              <button key={id} type="button" onClick={() => openNotification(path)} className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left hover:bg-slate-50">
                <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${color}`}><Icon /></span>
                <span className="min-w-0"><span className="block text-sm font-semibold text-slate-800">{title}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{detail}</span></span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default NotificationBell
