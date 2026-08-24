import { useEffect, useState } from 'react'
import { FiBox, FiCreditCard, FiDollarSign, FiFileText, FiShoppingBag, FiShoppingCart, FiTrendingUp } from 'react-icons/fi'

import { exportSpreadsheet } from '../../api/excelApi.js'
import { getReport } from '../../api/reportsApi.js'
import Toast from '../../components/Toast.jsx'
import ExpenseReport from '../../components/reports/ExpenseReport.jsx'
import OrderReport from '../../components/reports/OrderReport.jsx'
import PaymentReport from '../../components/reports/PaymentReport.jsx'
import PurchaseReport from '../../components/reports/PurchaseReport.jsx'
import ReportFilters from '../../components/reports/ReportFilters.jsx'
import SalesReport from '../../components/reports/SalesReport.jsx'
import StockReport from '../../components/reports/StockReport.jsx'

const emptyFilters = { fromDate: '', toDate: '', paymentType: '', orderType: '', paymentStatus: '', status: '', supplier: '', category: '' }

const reportTabs = [
  { id: 'sales', label: 'Sales', icon: FiTrendingUp, description: 'Sales, paid amounts, and money still due.' },
  { id: 'purchases', label: 'Purchases', icon: FiShoppingCart, description: 'Supplier purchases, payments, and balances.' },
  { id: 'expenses', label: 'Expenses', icon: FiDollarSign, description: 'Restaurant expenses grouped by category.' },
  { id: 'stock', label: 'Stock', icon: FiBox, description: 'Stock value, low stock, and item quantities.' },
  { id: 'payments', label: 'Payments', icon: FiCreditCard, description: 'Cash, UPI, card, paid, and due amounts.' },
  { id: 'orders', label: 'Orders', icon: FiShoppingBag, description: 'Order types, progress, and payment status.' },
]

function Reports() {
  const [activeReport, setActiveReport] = useState('sales')
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [report, setReport] = useState({ summary: {}, data: [], filters: {} })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const activeTab = reportTabs.find((tab) => tab.id === activeReport) || reportTabs[0]

  useEffect(() => {
    let active = true
    setLoading(true)
    getReport(activeReport, appliedFilters)
      .then((result) => {
        if (active) setReport({ summary: result.summary || {}, data: result.data || [], filters: result.filters || {} })
      })
      .catch((requestError) => {
        if (active) {
          setReport({ summary: {}, data: [], filters: {} })
          setMessage({ type: 'error', text: requestError.message })
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [activeReport, appliedFilters])

  const selectReport = (reportId) => {
    setActiveReport(reportId)
    setDraftFilters({ ...emptyFilters })
    setAppliedFilters({ ...emptyFilters })
    setMessage(null)
  }

  const updateFilter = (field, value) => setDraftFilters((current) => ({ ...current, [field]: value }))

  const applyFilters = () => {
    if (draftFilters.fromDate && draftFilters.toDate && draftFilters.fromDate > draftFilters.toDate) {
      setMessage({ type: 'error', text: 'The From Date must be before the To Date.' })
      return
    }
    setAppliedFilters({ ...draftFilters })
    setMessage({ type: 'success', text: 'Report updated.' })
  }

  const resetFilters = () => {
    setDraftFilters({ ...emptyFilters })
    setAppliedFilters({ ...emptyFilters })
    setMessage({ type: 'success', text: 'Filters cleared.' })
  }

  const prepareExport = async () => {
    try {
      await exportSpreadsheet('reports', appliedFilters)
      setMessage({ type: 'success', text: 'Report downloaded.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const commonProps = { summary: report.summary, rows: report.data }

  return (
    <main className="print-area px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="page-content space-y-6">
        <Toast message={message?.text} type={message?.type} onClose={() => setMessage(null)} />

        <header className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiFileText /></span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h1>
            <p className="mt-1 text-sm text-slate-500">Choose what you want to review.</p>
          </div>
        </header>

        <section className="print:hidden">
          <h2 className="mb-3 text-sm font-bold text-slate-800">1. Choose a report</h2>
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6" aria-label="Report sections">
            {reportTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => selectReport(id)}
                className={`flex min-h-12 items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition ${activeReport === id ? 'border-primary bg-primary-light text-primary-dark ring-2 ring-primary/10' : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:bg-slate-50'}`}
              >
                <Icon className="shrink-0 text-base" />
                {label}
              </button>
            ))}
          </nav>
        </section>

        <ReportFilters key={activeReport} activeReport={activeReport} filters={draftFilters} onChange={updateFilter} onApply={applyFilters} onReset={resetFilters} onExport={prepareExport} onPrint={() => window.print()} />

        <section className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900">{activeTab.label} Report</h2>
          <p className="mt-1 text-sm text-slate-500">{activeTab.description}</p>
        </section>

        {loading ? (
          <div className="grid min-h-72 place-items-center rounded-xl border border-slate-200 bg-white">
            <div className="text-center"><span className="mx-auto block size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading {activeTab.label.toLowerCase()} report...</p></div>
          </div>
        ) : (
          <>
            {activeReport === 'sales' && <SalesReport {...commonProps} />}
            {activeReport === 'purchases' && <PurchaseReport {...commonProps} />}
            {activeReport === 'expenses' && <ExpenseReport {...commonProps} />}
            {activeReport === 'stock' && <StockReport {...commonProps} />}
            {activeReport === 'payments' && <PaymentReport {...commonProps} />}
            {activeReport === 'orders' && <OrderReport {...commonProps} />}
          </>
        )}
      </div>
    </main>
  )
}

export default Reports
