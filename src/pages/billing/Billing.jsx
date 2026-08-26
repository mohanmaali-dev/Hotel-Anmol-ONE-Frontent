import { useCallback, useEffect, useRef, useState } from 'react'
import { FiAlertCircle, FiCreditCard, FiX } from 'react-icons/fi'

import { getBills } from '../../api/billingApi.js'
import Pagination from '../../components/Pagination.jsx'
import BillingFilters from '../../components/billing/BillingFilters.jsx'
import BillingTable from '../../components/billing/BillingTable.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emptyFilters = { search: '', paymentStatus: '', paymentType: '', date: '' }
const pageSize = 20

function Billing() {
  const { can } = useAuth()
  const requestIdRef = useRef(0)
  const [bills, setBills] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadBills = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError('')
    try {
      const result = await getBills({
        page,
        limit: pageSize,
        ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
        ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
        ...(filters.paymentType ? { paymentType: filters.paymentType } : {}),
        ...(filters.date ? { fromDate: filters.date, toDate: filters.date } : {}),
      })
      if (requestId !== requestIdRef.current) return
      setBills(result.data)
      setPagination(result.pagination || { page, limit: pageSize, total: result.data.length, pages: 1 })
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return
      setError(requestError.message)
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    const timer = window.setTimeout(loadBills, filters.search ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [filters.search, loadBills])

  const updateFilter = (field, value) => {
    setPage(1)
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="page-content">
        <div className="mb-6">
          <p className="text-sm font-semibold text-primary-dark">BILLING &amp; PAYMENTS</p>
          <div className="mt-1 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Restaurant Bills</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiCreditCard /></span></div>
          <p className="mt-1 text-sm text-slate-500">View bills and manage customer payments.</p>
        </div>

        {error && <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"><FiAlertCircle className="shrink-0" /><span className="flex-1">{error}</span><button type="button" onClick={() => setError('')} aria-label="Close billing error" className="grid size-6 place-items-center rounded-md hover:bg-rose-100"><FiX /></button></div>}

        <div className="space-y-5">
          <BillingFilters filters={filters} onChange={updateFilter} onClear={() => { setPage(1); setFilters(emptyFilters) }} />
          <BillingTable
            bills={bills}
            total={pagination.total}
            loading={loading}
            hasFilters={Object.values(filters).some(Boolean)}
            canViewOrders={can('orders', 'view')}
          />
          {!loading && <Pagination pagination={pagination} onPageChange={setPage} label="bills" />}
        </div>
      </div>
    </main>
  )
}

export default Billing
