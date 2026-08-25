import { useCallback, useEffect, useRef, useState } from 'react'
import { FiBookOpen, FiCreditCard, FiDollarSign, FiFileText, FiPackage, FiSearch, FiShoppingBag, FiShoppingCart, FiTruck, FiUsers } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import { searchAll } from '../../api/searchApi.js'
import { useAuth } from '../../context/AuthContext.jsx'

const sourceStyles = {
  Orders: 'bg-blue-50 text-blue-700',
  Bills: 'bg-violet-50 text-violet-700',
  Sales: 'bg-emerald-50 text-emerald-700',
  Purchases: 'bg-orange-50 text-orange-700',
  Stock: 'bg-cyan-50 text-cyan-700',
  Menu: 'bg-amber-50 text-amber-700',
  Suppliers: 'bg-indigo-50 text-indigo-700',
  Expenses: 'bg-rose-50 text-rose-700',
  Users: 'bg-slate-100 text-slate-700',
}

const sourceIcons = { Orders: FiShoppingBag, Bills: FiFileText, Sales: FiCreditCard, Purchases: FiShoppingCart, Stock: FiPackage, Menu: FiBookOpen, Suppliers: FiTruck, Expenses: FiDollarSign, Users: FiUsers }
const resultPath = ({ source, id }) => ({ Orders: `/orders/${id}`, Bills: `/billing/${id}`, Sales: `/sales/${id}`, Purchases: `/purchases/${id}`, Stock: `/stock/history?item=${id}`, Menu: `/menu/items/${id}`, Suppliers: `/suppliers/${id}`, Expenses: `/expenses/${id}`, Users: `/users/${id}` })[source]

function GlobalSearch() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const requestRef = useRef(0)
  const { can } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const canOrders = can('orders', 'view')
  const canBilling = can('billing', 'view')
  const canSales = can('sales', 'view')
  const canPurchases = can('purchases', 'view')
  const canStock = can('stock', 'view')
  const canMenu = can('menu', 'view')
  const canSuppliers = can('suppliers', 'view')
  const canExpenses = can('expenses', 'view')
  const canUsers = can('users', 'view')
  const hasSearchAccess = canOrders || canBilling || canSales || canPurchases || canStock || canMenu || canSuppliers || canExpenses || canUsers

  const searchRecords = useCallback(async (searchText) => {
    const requestId = ++requestRef.current
    setLoading(true)
    setError('')
    try {
      const records = await searchAll(searchText)
      if (requestId !== requestRef.current) return
      setResults(records.map((record) => ({ ...record, path: resultPath(record), Icon: sourceIcons[record.source] || FiSearch })))
    } catch {
      if (requestId === requestRef.current) setError('Search is unavailable right now.')
    } finally {
      if (requestId === requestRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const searchText = query.trim()
    if (searchText.length < 2) {
      requestRef.current += 1
      setResults([])
      setLoading(false)
      setError('')
      return undefined
    }
    requestRef.current += 1
    const timer = window.setTimeout(() => searchRecords(searchText), 300)
    return () => window.clearTimeout(timer)
  }, [query, searchRecords])

  useEffect(() => {
    const closeSearch = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', closeSearch)
    return () => document.removeEventListener('mousedown', closeSearch)
  }, [])

  const openResult = (path) => {
    setOpen(false)
    setQuery('')
    navigate(path)
  }

  if (!hasSearchAccess) return null

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <label className="relative block">
        <span className="sr-only">Search restaurant records</span>
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setOpen(true) }}
          onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false) }}
          placeholder="Search orders, stock, menu..."
          aria-expanded={open && query.trim().length >= 2}
          className="h-10 w-60 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 xl:w-80"
        />
      </label>

      {open && query.trim().length >= 2 && (
        <section className="absolute right-0 top-12 z-50 w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="border-b border-slate-100 px-4 py-3"><h2 className="text-sm font-bold text-slate-900">Search Results</h2><p className="mt-0.5 text-xs text-slate-500">Select a result to open it.</p></div>
          <div className="max-h-[26rem] overflow-y-auto p-2">
            {loading && <div className="px-3 py-8 text-center text-sm text-slate-500">Searching...</div>}
            {!loading && error && <div className="px-3 py-8 text-center text-sm font-medium text-rose-600">{error}</div>}
            {!loading && !error && !results.length && <div className="px-3 py-8 text-center"><FiSearch className="mx-auto text-2xl text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-700">No matching records</p><p className="mt-1 text-xs text-slate-500">Try a name, number, phone, or description.</p></div>}
            {!loading && results.map(({ source, title, detail, path, Icon }, index) => (
              <button key={`${source}-${path}-${index}`} type="button" onClick={() => openResult(path)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50">
                <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${sourceStyles[source]}`}><Icon /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{detail}</span></span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">{source}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default GlobalSearch
