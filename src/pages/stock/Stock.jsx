import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiArrowDown, FiArrowUp, FiClock, FiPackage, FiPlus } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'

import { deleteStockItem, getStockItems, getStockSummary, stockIn, stockOut } from '../../api/stockApi.js'
import { getSuppliers } from '../../api/supplierApi.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'
import Pagination from '../../components/Pagination.jsx'
import Toast from '../../components/Toast.jsx'
import StockFilters from '../../components/stock/StockFilters.jsx'
import StockInForm from '../../components/stock/StockInForm.jsx'
import StockOutForm from '../../components/stock/StockOutForm.jsx'
import StockSummary from '../../components/stock/StockSummary.jsx'
import StockTable from '../../components/stock/StockTable.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emptyFilters = { search: '', category: '', status: '' }
const emptySummary = { totalStockItems: 0, totalStockValue: 0, lowStockItems: 0, outOfStockItems: 0 }
const pageSize = 20

function Stock() {
  const location = useLocation()
  const { can } = useAuth()
  const [items, setItems] = useState([])
  const [catalog, setCatalog] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [summary, setSummary] = useState(emptySummary)
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [movementMode, setMovementMode] = useState('')
  const [selectedItemId, setSelectedItemId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [notice, setNotice] = useState(location.state?.message ? { type: 'success', text: location.state.message } : null)

  useEffect(() => {
    getStockItems({ page: 1, limit: 100 }).then((result) => setCatalog(result.data)).catch(() => {})
    getSuppliers({ page: 1, limit: 100 }).then((result) => setSuppliers(result.data)).catch(() => {})
  }, [])

  const loadStock = useCallback(async () => {
    setLoading(true)
    try {
      const [itemsResult, summaryResult] = await Promise.all([
        getStockItems({ page, limit: pageSize, ...(filters.search.trim() ? { search: filters.search.trim() } : {}), ...(filters.category ? { category: filters.category } : {}), ...(filters.status ? { status: filters.status } : {}) }),
        getStockSummary(),
      ])
      setItems(itemsResult.data)
      setPagination(itemsResult.pagination || { page, limit: pageSize, total: itemsResult.data.length, pages: 1 })
      setSummary({ ...emptySummary, ...summaryResult.data })
    } catch (requestError) {
      setItems([])
      setSummary(emptySummary)
      setNotice({ type: 'error', text: requestError.message })
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    const timer = window.setTimeout(loadStock, filters.search ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [filters.search, loadStock])

  const categories = useMemo(() => [...new Set(catalog.map((item) => item.category).filter(Boolean))].sort(), [catalog])
  const movementItems = catalog.length ? catalog : items

  const openMovement = (mode, itemId = '') => {
    setMovementMode(mode)
    setSelectedItemId(itemId || movementItems[0]?.id || '')
    setNotice(null)
  }

  const refreshAllStock = async () => {
    const catalogResult = await getStockItems({ page: 1, limit: 100 })
    setCatalog(catalogResult.data)
    await loadStock()
  }

  const handleStockIn = async (movement) => {
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await stockIn(movement)
      await refreshAllStock()
      setMovementMode('')
      setNotice({ type: 'success', text: result.message })
    } catch (requestError) {
      setNotice({ type: 'error', text: requestError.message })
    } finally { setSubmitting(false) }
  }

  const handleStockOut = async (movement) => {
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await stockOut(movement)
      await refreshAllStock()
      setMovementMode('')
      setNotice({ type: 'success', text: result.message })
    } catch (requestError) {
      setNotice({ type: 'error', text: requestError.message })
    } finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!pendingDelete || deleting) return
    setDeleting(true)
    try {
      const result = await deleteStockItem(pendingDelete.id)
      setPendingDelete(null)
      await refreshAllStock()
      setNotice({ type: 'success', text: result.message })
    } catch (requestError) {
      setPendingDelete(null)
      setNotice({ type: 'error', text: requestError.message })
    } finally { setDeleting(false) }
  }

  const updateFilter = (field, value) => { setPage(1); setFilters((current) => ({ ...current, [field]: value })) }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <Toast message={notice?.text} type={notice?.type} onClose={() => setNotice(null)} />
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><p className="text-sm font-semibold text-primary-dark">STOCK &amp; INVENTORY</p><div className="mt-1 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Current Stock</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiPackage /></span></div><p className="mt-1 text-sm text-slate-500">Monitor quantities and record every stock movement.</p></div><div className="flex flex-wrap gap-2">{can('stock', 'create') && <Link to="/stock/items" className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"><FiPlus /> Add Stock Item</Link>}{can('stock', 'edit') && <><button type="button" onClick={() => openMovement('in')} disabled={!movementItems.length} className="flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"><FiArrowDown /> Stock In</button><button type="button" onClick={() => openMovement('out')} disabled={!movementItems.length} className="flex h-10 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"><FiArrowUp /> Stock Out</button></>}<Link to="/stock/history" className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-primary-dark"><FiClock /> View History</Link></div></div>
      <StockSummary summary={summary} loading={loading} />
      {movementMode === 'in' && <div className="mt-6"><StockInForm key={`in-${selectedItemId}`} items={movementItems} suppliers={suppliers} selectedItemId={selectedItemId} onSubmit={handleStockIn} onCancel={() => setMovementMode('')} submitting={submitting} /></div>}
      {movementMode === 'out' && <div className="mt-6"><StockOutForm key={`out-${selectedItemId}`} items={movementItems} selectedItemId={selectedItemId} onSubmit={handleStockOut} onCancel={() => setMovementMode('')} submitting={submitting} /></div>}
      <div className="mt-6 space-y-5"><StockFilters filters={filters} categories={categories} onChange={updateFilter} onClear={() => { setPage(1); setFilters(emptyFilters) }} /><StockTable items={items} total={pagination.total} loading={loading} canEdit={can('stock', 'edit')} canDelete={can('stock', 'delete')} onStockIn={(itemId) => openMovement('in', itemId)} onStockOut={(itemId) => openMovement('out', itemId)} onDelete={setPendingDelete} />{!loading && <Pagination pagination={pagination} onPageChange={setPage} label="items" />}</div>
      <ConfirmDeleteModal open={Boolean(pendingDelete)} title={`Delete ${pendingDelete?.name || 'stock item'}?`} message="This stock item will be permanently removed." dependencyType="stock-item" recordId={pendingDelete?.id} confirmLabel="Delete Stock Item" loading={deleting} onConfirm={handleDelete} onClose={() => setPendingDelete(null)} />
    </div></main>
  )
}

export default Stock
