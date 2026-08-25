import { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft, FiClock, FiX } from 'react-icons/fi'
import { Link, useSearchParams } from 'react-router-dom'

import { getAllStockItems, getStockHistory } from '../../api/stockApi.js'
import DatePickerField from '../../components/DatePickerField.jsx'
import MobileFilterPanel from '../../components/MobileFilterPanel.jsx'
import Pagination from '../../components/Pagination.jsx'
import StockHistoryTable from '../../components/stock/StockHistoryTable.jsx'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'
const pageSize = 20

function StockHistory() {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [movements, setMovements] = useState([])
  const [filters, setFilters] = useState({ item: searchParams.get('item') || '', type: '', fromDate: '', toDate: '' })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllStockItems().then(setItems).catch(() => {})
  }, [])

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getStockHistory({ page, limit: pageSize, ...(filters.item ? { item: filters.item } : {}), ...(filters.type ? { type: filters.type } : {}), ...(filters.fromDate ? { fromDate: filters.fromDate } : {}), ...(filters.toDate ? { toDate: filters.toDate } : {}) })
      setMovements(result.data)
      setPagination(result.pagination || { page, limit: pageSize, total: result.data.length, pages: 1 })
    } catch (requestError) {
      setMovements([])
      setError(requestError.message)
    } finally { setLoading(false) }
  }, [filters, page])

  useEffect(() => { loadHistory() }, [loadHistory])

  const updateFilter = (field, value) => { setPage(1); setFilters((current) => ({ ...current, [field]: value })) }
  const clearFilters = () => { setPage(1); setFilters({ item: '', type: '', fromDate: '', toDate: '' }) }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <div className="mb-6"><Link to="/stock" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Stock</Link><div className="mt-3 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Stock History</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiClock /></span></div><p className="mt-1 text-sm text-slate-500">A complete record of inventory movements.</p></div>
      {error && <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"><span className="flex-1">{error}</span><button type="button" onClick={() => setError('')} aria-label="Close error message" className="grid size-6 place-items-center rounded-md hover:bg-rose-100"><FiX /></button></div>}
      <MobileFilterPanel filters={filters} className="mb-5 p-4"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
        <select aria-label="Stock item" value={filters.item} onChange={(event) => updateFilter('item', event.target.value)} className={inputClass}><option value="">All items</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select aria-label="Movement type" value={filters.type} onChange={(event) => updateFilter('type', event.target.value)} className={inputClass}><option value="">All movement types</option><option value="IN">Stock In</option><option value="OUT">Stock Out</option></select>
        <DatePickerField label="From" value={filters.fromDate} onChange={(value) => updateFilter('fromDate', value)} />
        <DatePickerField label="To" value={filters.toDate} onChange={(value) => updateFilter('toDate', value)} />
        <button type="button" onClick={clearFilters} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><FiX /> Clear</button>
      </div></MobileFilterPanel>
      <div className="space-y-5"><StockHistoryTable movements={movements} total={pagination.total} loading={loading} />{!loading && <Pagination pagination={pagination} onPageChange={setPage} label="movements" />}</div>
    </div></main>
  )
}

export default StockHistory
