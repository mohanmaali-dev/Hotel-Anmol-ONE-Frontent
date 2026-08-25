import { useCallback, useEffect, useState } from 'react'
import { FiPlus, FiShoppingCart } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'

import { getPurchases } from '../../api/purchaseApi.js'
import { getAllSuppliers } from '../../api/supplierApi.js'
import Pagination from '../../components/Pagination.jsx'
import PurchaseFilters from '../../components/purchases/PurchaseFilters.jsx'
import PurchaseTable from '../../components/purchases/PurchaseTable.jsx'
import Toast from '../../components/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emptyFilters = { search: '', supplier: '', fromDate: '', toDate: '', paymentStatus: '', purchaseStatus: '' }
const pageSize = 20

function Purchases() {
  const location = useLocation()
  const { can } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(location.state?.message || '')

  useEffect(() => {
    getAllSuppliers({ status: 'Active' })
      .then(setSuppliers)
      .catch(() => setSuppliers([]))
  }, [])

  const loadPurchases = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getPurchases({
        page,
        limit: pageSize,
        ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
        ...(filters.supplier ? { supplier: filters.supplier } : {}),
        ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
        ...(filters.toDate ? { toDate: filters.toDate } : {}),
        ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
        ...(filters.purchaseStatus ? { purchaseStatus: filters.purchaseStatus } : {}),
      })
      setPurchases(result.data)
      setPagination(result.pagination || { page, limit: pageSize, total: result.data.length, pages: 1 })
    } catch (requestError) {
      setPurchases([])
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    const timer = window.setTimeout(loadPurchases, filters.search ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [filters.search, loadPurchases])

  const updateFilter = (field, value) => {
    setPage(1)
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <Toast message={error || message} type={error ? 'error' : 'success'} onClose={() => { setError(''); setMessage('') }} />
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary-dark">PURCHASE MANAGEMENT</p><div className="mt-1 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Restaurant Purchases</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiShoppingCart /></span></div><p className="mt-1 text-sm text-slate-500">Track supplier purchases and payments.</p></div>{can('purchases', 'create') && <Link to="/purchases/new" className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"><FiPlus /> New Purchase</Link>}</div>
      <div className="space-y-5"><PurchaseFilters filters={filters} suppliers={suppliers} onChange={updateFilter} onClear={() => { setPage(1); setFilters(emptyFilters) }} /><PurchaseTable purchases={purchases} total={pagination.total} loading={loading} />{!loading && <Pagination pagination={pagination} onPageChange={setPage} label="purchases" />}</div>
    </div></main>
  )
}

export default Purchases
