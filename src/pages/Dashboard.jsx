import { useCallback, useEffect, useRef, useState } from 'react'
import { FiAlertCircle, FiCalendar, FiRefreshCw, FiX } from 'react-icons/fi'

import { getDashboardData } from '../api/dashboardApi.js'
import LowStock from '../components/dashboard/LowStock.jsx'
import RecentOrders from '../components/dashboard/RecentOrders.jsx'
import StatCard from '../components/dashboard/StatCard.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { formatCurrency, setDefaultCurrency } from '../utils/orderFormatters.js'

const emptyDashboard = {
  access: { sales: false, orders: false, purchases: false, stock: false },
  sales: null,
  orders: null,
  purchases: null,
  stock: null,
  today: '',
  timezone: 'Asia/Kolkata',
}

function Dashboard() {
  const { user } = useAuth()
  const { settings } = useSettings()
  setDefaultCurrency(settings.restaurant.currency)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const lastUpdatedRef = useRef(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getDashboardData()
      setDashboard(result)
      const refreshedAt = new Date(result.refreshedAt || Date.now())
      lastUpdatedRef.current = refreshedAt
      setLastUpdated(refreshedAt)
    } catch {
      setError(lastUpdatedRef.current ? 'Dashboard could not refresh. The previous information is still shown.' : 'Dashboard information could not be loaded. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const stats = []
  if (dashboard.access.sales && dashboard.sales) {
    stats.push(
      { title: "Today's Sales", value: formatCurrency(dashboard.sales.totalSales), change: 'Today', helperText: 'from generated bills', icon: 'sales', color: 'emerald' },
      { title: 'Pending Payments', value: formatCurrency(dashboard.sales.dueAmount), change: 'Due', helperText: 'on today’s bills', icon: 'payments', color: 'amber' },
    )
  }
  if (dashboard.access.orders && dashboard.orders) {
    stats.push({ title: "Today's Orders", value: dashboard.orders.todayOrders, change: 'Today', helperText: 'orders received', icon: 'orders', color: 'blue' })
  }
  if (dashboard.access.purchases && dashboard.purchases) {
    stats.push({ title: 'Total Purchase', value: formatCurrency(dashboard.purchases.totalPurchaseAmount), change: 'Total', helperText: 'excluding cancelled purchases', icon: 'purchases', color: 'violet' })
  }
  if (dashboard.access.stock && dashboard.stock) {
    const stockAlerts = dashboard.stock.lowStockItems + dashboard.stock.outOfStockItems
    stats.push(
      { title: 'Stock Items', value: dashboard.stock.totalStockItems, change: 'Live', helperText: 'active inventory items', icon: 'stock', color: 'cyan' },
      { title: 'Stock Alerts', value: stockAlerts, change: 'Check', helperText: `${dashboard.stock.lowStockItems} low · ${dashboard.stock.outOfStockItems} out`, icon: 'lowStock', color: 'rose' },
    )
  }
  const dashboardDate = dashboard.today ? new Date(`${dashboard.today}T00:00:00Z`) : new Date()
  const todayLabel = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dashboardDate)
  const lastUpdatedLabel = lastUpdated
    ? new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: dashboard.timezone,
      }).format(lastUpdated)
    : ''

  return (
    <div className="min-h-screen bg-cream text-slate-800">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Navbar subtitle="Live restaurant overview" onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="page-content">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-primary-dark">OVERVIEW</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Welcome, {user?.name?.split(' ')[0] || user?.username}!</h2>
                <p className="mt-1 text-sm text-slate-500">Here is what is happening at your restaurant today.</p>
              </div>
              <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
                <div><time className="flex h-9 items-center gap-2 px-1 text-sm font-medium text-slate-500" title={`Dashboard figures use ${dashboard.timezone}`}><FiCalendar className="text-primary-dark" /><span><span className="font-semibold text-slate-700">Today</span> · {todayLabel}</span></time>{lastUpdatedLabel && <p className="px-1 text-[11px] text-slate-400">Updated at {lastUpdatedLabel}</p>}</div>
                <button type="button" onClick={loadDashboard} disabled={loading} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-60"><FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh</button>
              </div>
            </div>

            {error && <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"><FiAlertCircle className="shrink-0" /><span className="flex-1">{error}</span><button type="button" onClick={() => setError('')} aria-label="Close dashboard error" className="grid size-6 place-items-center rounded-md hover:bg-rose-100"><FiX /></button></div>}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {loading && !lastUpdated ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white p-5"><div className="h-4 w-24 rounded bg-slate-100" /><div className="mt-4 h-7 w-32 rounded bg-slate-100" /><div className="mt-5 h-3 w-40 rounded bg-slate-100" /></div>) : stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
            </section>

            {!loading && lastUpdated && !stats.length && <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">No dashboard sections are available for this user.</div>}

            {(dashboard.access.orders || dashboard.access.stock) && <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              {dashboard.access.orders && <RecentOrders orders={dashboard.orders?.recentOrders || []} loading={loading && !lastUpdated} fullWidth={!dashboard.access.stock} />}
              {dashboard.access.stock && <LowStock items={dashboard.stock?.attentionItems || []} loading={loading && !lastUpdated} className={dashboard.access.orders ? '' : 'xl:col-span-3'} />}
            </div>}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
