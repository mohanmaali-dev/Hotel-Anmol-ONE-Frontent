import { useCallback, useEffect, useRef, useState } from 'react'
import { FiPlus, FiShoppingCart } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  const { can } = useAuth()
  const requestIdRef = useRef(0)
  const canViewSuppliers = can('suppliers', 'view')
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [supplierError, setSupplierError] = useState('')
  const [message, setMessage] = useState(location.state?.message || '')

  useEffect(() => {
    if (!canViewSuppliers) {
      setSuppliers([])
      return undefined
    }
    let active = true
    setSupplierError('')
    getAllSuppliers()
      .then((data) => { if (active) setSuppliers(data) })
      .catch((requestError) => { if (active) { setSuppliers([]); setSupplierError(`Supplier filter could not be loaded. ${requestError.message}`) } })
    return () => { active = false }
  }, [canViewSuppliers])

  const loadPurchases = useCallback(async () => {
    const requestId = ++requestIdRef.current
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
      if (requestId !== requestIdRef.current) return
      setPurchases(result.data)
      setPagination(result.pagination || { page, limit: pageSize, total: result.data.length, pages: 1 })
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return
      setError(requestError.message)
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    const timer = window.setTimeout(loadPurchases, filters.search ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [filters.search, loadPurchases])

  useEffect(() => {
    if (!location.state?.message) return
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state?.message, navigate])

  const updateFilter = (field, value) => {
    setPage(1)
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <Toast message={error || supplierError || message} type={error || supplierError ? 'error' : 'success'} onClose={() => { setError(''); setSupplierError(''); setMessage('') }} />
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary-dark">PURCHASE MANAGEMENT</p><div className="mt-1 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Restaurant Purchases</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiShoppingCart /></span></div><p className="mt-1 text-sm text-slate-500">Track supplier purchases and payments.</p></div>{can('purchases', 'create') && <Link to="/purchases/new" className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"><FiPlus /> New Purchase</Link>}</div>
      <div className="space-y-5"><PurchaseFilters filters={filters} suppliers={suppliers} showSupplierFilter={canViewSuppliers} onChange={updateFilter} onClear={() => { setPage(1); setFilters(emptyFilters) }} /><PurchaseTable purchases={purchases} total={pagination.total} loading={loading} hasFilters={Object.values(filters).some(Boolean)} canCreate={can('purchases', 'create')} canViewSuppliers={canViewSuppliers} />{!loading && <Pagination pagination={pagination} onPageChange={setPage} label="purchases" />}</div>
    </div></main>
  )
}

export default Purchases
