import { useCallback, useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'

import { deleteOrder, getOrders, updateOrder } from '../../api/orderApi.js'
import OrderFilters from '../../components/orders/OrderFilters.jsx'
import OrderTable from '../../components/orders/OrderTable.jsx'
import Toast from '../../components/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emptyFilters = { search: '', orderType: '', paymentStatus: '', orderStatus: '', date: '' }
const pageSize = 20

function Orders() {
  const { can } = useAuth()
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(location.state?.message || '')

  const loadOrders = useCallback(async () => {
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
      setOrders(result.data)
      setPagination(result.pagination || { page, limit: pageSize, total: result.data.length, pages: 1 })
    } catch (requestError) {
      setOrders([])
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

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
          <OrderTable orders={orders} total={pagination.total} loading={loading} canEdit={can('orders', 'edit')} canDelete={can('orders', 'delete')} onCancel={handleCancel} onDelete={handleDelete} />

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
