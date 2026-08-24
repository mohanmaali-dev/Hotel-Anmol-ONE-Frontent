import { useCallback, useEffect, useState } from 'react'
import { FiAlertCircle, FiCalendar, FiRefreshCw, FiX } from 'react-icons/fi'

import { getDashboardData } from '../api/dashboardApi.js'
import LowStock from '../components/dashboard/LowStock.jsx'
import RecentOrders from '../components/dashboard/RecentOrders.jsx'
import StatCard from '../components/dashboard/StatCard.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCurrency } from '../utils/orderFormatters.js'

const emptyDashboard = {
  sales: { totalSales: 0, dueAmount: 0 },
  todayOrders: 0,
  recentOrders: [],
  stock: { totalStockItems: 0, lowStockItems: 0 },
  lowStock: [],
  hasRestrictedData: false,
  hasPartialData: false,
}

function Dashboard() {
  const { user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setDashboard(await getDashboardData())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const stats = [
    { title: "Today's Sales", value: formatCurrency(dashboard.sales.totalSales), change: 'Live', helperText: 'from generated bills', icon: 'sales', color: 'emerald' },
    { title: "Today's Orders", value: dashboard.todayOrders, change: 'Today', helperText: 'orders received', icon: 'orders', color: 'blue' },
    { title: 'Pending Payments', value: formatCurrency(dashboard.sales.dueAmount), change: 'Due', helperText: 'on today’s bills', icon: 'payments', color: 'amber' },
    { title: 'Current Stock', value: dashboard.stock.totalStockItems, change: 'Live', helperText: 'inventory items', icon: 'stock', color: 'cyan' },
    { title: 'Low Stock', value: dashboard.stock.lowStockItems, change: 'Alert', helperText: 'items need attention', icon: 'lowStock', color: 'rose' },
  ]
  const todayLabel = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

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
              <div className="flex items-center gap-2">
                <time className="flex h-10 items-center gap-2 px-1 text-sm font-medium text-slate-500" title="Dashboard figures shown for today"><FiCalendar className="text-primary-dark" /><span><span className="font-semibold text-slate-700">Today</span> · {todayLabel}</span></time>
                <button type="button" onClick={loadDashboard} disabled={loading} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-60"><FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh</button>
              </div>
            </div>

            {error && <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"><FiAlertCircle className="shrink-0" /><span className="flex-1">{error}</span><button type="button" onClick={() => setError('')} aria-label="Close dashboard error" className="grid size-6 place-items-center rounded-md hover:bg-rose-100"><FiX /></button></div>}
            {dashboard.hasRestrictedData && <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">Some sales figures are hidden because your role does not have Sales access.</div>}
            {dashboard.hasPartialData && !dashboard.hasRestrictedData && <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">Some dashboard information could not be loaded. Use Refresh to try again.</div>}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {loading ? Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white p-5"><div className="h-4 w-24 rounded bg-slate-100" /><div className="mt-4 h-7 w-32 rounded bg-slate-100" /><div className="mt-5 h-3 w-40 rounded bg-slate-100" /></div>) : stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
            </section>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <RecentOrders orders={dashboard.recentOrders} loading={loading} />
              <LowStock items={dashboard.lowStock} loading={loading} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
