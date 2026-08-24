import { useCallback, useEffect, useState } from 'react'
import { FiFileText, FiPlus } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'

import { getExpenses, getExpenseSummary } from '../../api/expenseApi.js'
import Pagination from '../../components/Pagination.jsx'
import ExpenseFilters from '../../components/expenses/ExpenseFilters.jsx'
import ExpenseSummary from '../../components/expenses/ExpenseSummary.jsx'
import ExpenseTable from '../../components/expenses/ExpenseTable.jsx'
import Toast from '../../components/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const emptyFilters = { search: '', category: '', fromDate: '', toDate: '', paymentType: '' }
const emptySummary = { todayExpenses: 0, monthExpenses: 0, totalExpenses: 0 }
const pageSize = 20

function Expenses() {
  const location = useLocation()
  const { can } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [totals, setTotals] = useState(emptySummary)
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(location.state?.message ? { type: 'success', text: location.state.message } : null)

  const loadExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const [listResult, summaryResult] = await Promise.all([
        getExpenses({ page, limit: pageSize, ...(filters.search.trim() ? { search: filters.search.trim() } : {}), ...(filters.category ? { category: filters.category } : {}), ...(filters.fromDate ? { fromDate: filters.fromDate } : {}), ...(filters.toDate ? { toDate: filters.toDate } : {}), ...(filters.paymentType ? { paymentType: filters.paymentType } : {}) }),
        getExpenseSummary(),
      ])
      setExpenses(listResult.data)
      setPagination(listResult.pagination || { page, limit: pageSize, total: listResult.data.length, pages: 1 })
      setTotals({ ...emptySummary, ...summaryResult.data })
    } catch (requestError) {
      setExpenses([]); setTotals(emptySummary)
      setNotice({ type: 'error', text: requestError.message })
    } finally { setLoading(false) }
  }, [filters, page])

  useEffect(() => { const timer = window.setTimeout(loadExpenses, filters.search ? 300 : 0); return () => window.clearTimeout(timer) }, [filters.search, loadExpenses])
  const updateFilter = (field, value) => { setPage(1); setFilters((current) => ({ ...current, [field]: value })) }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <Toast message={notice?.text} type={notice?.type} onClose={() => setNotice(null)} />
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-primary-dark">EXPENSE MANAGEMENT</p><div className="mt-1 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Restaurant Expenses</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiFileText /></span></div><p className="mt-1 text-sm text-slate-500">Track day-to-day operating expenses separately from purchases.</p></div>{can('expenses', 'create') && <Link to="/expenses/new" className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus /> Add Expense</Link>}</div>
      <ExpenseSummary totals={totals} loading={loading} />
      <div className="mt-6 space-y-5"><ExpenseFilters filters={filters} onChange={updateFilter} onClear={() => { setPage(1); setFilters(emptyFilters) }} /><ExpenseTable expenses={expenses} total={pagination.total} loading={loading} />{!loading && <Pagination pagination={pagination} onPageChange={setPage} label="expenses" />}</div>
    </div></main>
  )
}

export default Expenses
