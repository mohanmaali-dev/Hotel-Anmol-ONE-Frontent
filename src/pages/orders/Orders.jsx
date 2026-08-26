import { useCallback, useEffect, useRef, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { deleteOrder, getOrders, updateOrder } from '../../api/orderApi.js'
import { generateBillFromOrder } from '../../api/billingApi.js'
import OrderFilters from '../../components/orders/OrderFilters.jsx'
import OrderTable from '../../components/orders/OrderTable.jsx'
import Toast from '../../components/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emptyFilters = { search: '', orderType: '', paymentStatus: '', orderStatus: '', date: '' }
const pageSize = 20

function Orders() {
  const { can } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const requestIdRef = useRef(0)
  const [orders, setOrders] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(location.state?.message || '')

  const loadOrders = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError('')
    try {
      const result = await getOrders({
        page,
        limit: pageSize,
        ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
        ...(filters.orderType ? { orderType: filters.orderType } : {}),
        ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
        ...(filters.orderStatus ? { status: filters.orderStatus } : {}),
        ...(filters.date ? { fromDate: filters.date, toDate: filters.date } : {}),
      })
      if (requestId !== requestIdRef.current) return
      setOrders(result.data)
      setPagination(result.pagination || { page, limit: pageSize, total: result.data.length, pages: 1 })
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return
      setError(requestError.message)
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    if (!location.state?.message) return
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state?.message, navigate])

  useEffect(() => {
    const timer = window.setTimeout(loadOrders, filters.search ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [loadOrders, filters.search])

  const updateFilter = (field, value) => {
    setPage(1)
    setFilters((current) => ({ ...current, [field]: value }))
  }

  const handleCancel = async (order) => {
    setError('')
    try {
      await updateOrder(order.id, { orderStatus: 'Cancelled' })
      setMessage(`${order.orderNo} was cancelled. Its history is still available.`)
      await loadOrders()
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    }
  }

  const handleDelete = async (order) => {
    setError('')
    try {
      await deleteOrder(order.id)
      setMessage(`${order.orderNo} was permanently deleted.`)
      if (orders.length === 1 && page > 1) setPage((current) => current - 1)
      else await loadOrders()
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    }
  }

  const handleGenerateBill = async (order) => {
    setError('')
    try {
      const result = await generateBillFromOrder(order.id)
      navigate(`/billing/${result.data.id}`, {
        state: { message: result.message || 'Bill generated successfully.' },
      })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="page-content">
        <Toast message={error || message} type={error ? 'error' : 'success'} onClose={() => { setError(''); setMessage('') }} />
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-primary-dark">ORDER MANAGEMENT</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Restaurant Orders</h2>
            <p className="mt-1 text-sm text-slate-500">View, filter, and manage customer orders.</p>
          </div>
          {can('orders', 'create') && (
            <Link to="/orders/new" className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark">
              <FiPlus /> New Order
            </Link>
          )}
        </div>

        <div className="space-y-5">
          <OrderFilters filters={filters} onChange={updateFilter} onClear={() => { setPage(1); setFilters(emptyFilters) }} />
          <OrderTable
            orders={orders}
            total={pagination.total}
            loading={loading}
            hasFilters={Object.values(filters).some(Boolean)}
            canCreate={can('orders', 'create')}
            canEdit={can('orders', 'edit')}
            canDelete={can('orders', 'delete')}
            canViewBilling={can('billing', 'view')}
            canCreateBill={can('billing', 'view') && can('billing', 'create')}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onGenerateBill={handleGenerateBill}
          />

          {!loading && pagination.pages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row">
              <p className="text-sm text-slate-500">Page <span className="font-semibold text-slate-800">{pagination.page}</span> of <span className="font-semibold text-slate-800">{pagination.pages}</span> · {pagination.total} orders</p>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><FiChevronLeft /> Previous</button>
                <button type="button" disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)} className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next <FiChevronRight /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Orders
