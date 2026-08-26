import { useCallback, useEffect, useRef, useState } from 'react'
import { FiAlertCircle, FiTrendingUp, FiX } from 'react-icons/fi'

import { getSales, getSalesSummary } from '../../api/salesApi.js'
import Pagination from '../../components/Pagination.jsx'
import SalesFilters from '../../components/sales/SalesFilters.jsx'
import SalesSummary from '../../components/sales/SalesSummary.jsx'
import SalesTable from '../../components/sales/SalesTable.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emptyFilters = { search: '', fromDate: '', toDate: '', orderType: '', paymentType: '', paymentStatus: '' }
const emptySummary = { totalSales: 0, paidAmount: 0, dueAmount: 0, cashSales: 0, upiSales: 0, cardSales: 0, totalOrders: 0 }
const pageSize = 20

function Sales() {
  const { user, can } = useAuth()
  const requestIdRef = useRef(0)
  const [sales, setSales] = useState([])
  const [summary, setSummary] = useState(emptySummary)
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [summaryError, setSummaryError] = useState('')

  const loadSales = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setListError('')
    try {
      const salesResult = await getSales({
        page,
        limit: pageSize,
        ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
        ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
        ...(filters.toDate ? { toDate: filters.toDate } : {}),
        ...(filters.orderType ? { orderType: filters.orderType } : {}),
        ...(filters.paymentType ? { paymentType: filters.paymentType } : {}),
        ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
      })
      if (requestId !== requestIdRef.current) return
      setSales(
        salesResult.data.map((sale) => ({
          ...sale,
          billerName:
            String(sale.biller) === String(user?._id) ? user.name : sale.billerName,
        })),
      )
      setPagination(salesResult.pagination || { page, limit: pageSize, total: salesResult.data.length, pages: 1 })
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return
      setListError(requestError.message)
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [filters, page, user?._id, user?.name])

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true)
    setSummaryError('')
    try {
      const result = await getSalesSummary()
      setSummary({ ...emptySummary, ...result.data })
    } catch (requestError) {
      setSummaryError(requestError.message)
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  useEffect(() => {
    const timer = window.setTimeout(loadSales, filters.search ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [filters.search, loadSales])

  const updateFilter = (field, value) => {
    setPage(1)
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="page-content">
        <div className="mb-6"><p className="text-sm font-semibold text-primary-dark">SALES OVERVIEW</p><div className="mt-1 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Restaurant Sales</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiTrendingUp /></span></div><p className="mt-1 text-sm text-slate-500">Sales generated automatically from restaurant bills.</p></div>

        {(listError || summaryError) && <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"><FiAlertCircle className="shrink-0" /><span className="flex-1">{listError || `Today's sales summary could not be loaded. ${summaryError}`}</span><button type="button" onClick={() => { setListError(''); setSummaryError('') }} aria-label="Close sales error" className="grid size-6 place-items-center rounded-md hover:bg-rose-100"><FiX /></button></div>}

        <SalesSummary summary={summary} loading={summaryLoading} />
        <div className="mt-6 space-y-5">
          <SalesFilters filters={filters} onChange={updateFilter} onClear={() => { setPage(1); setFilters(emptyFilters) }} />
          <SalesTable
            sales={sales}
            total={pagination.total}
            loading={loading}
            hasFilters={Object.values(filters).some(Boolean)}
            canViewBilling={can('billing', 'view')}
            canViewOrders={can('orders', 'view')}
          />
          {!loading && <Pagination pagination={pagination} onPageChange={setPage} label="sales" />}
        </div>
      </div>
    </main>
  )
}

export default Sales
