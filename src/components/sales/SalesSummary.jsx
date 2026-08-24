import { FiAlertCircle, FiCheckCircle, FiCreditCard, FiDollarSign, FiShoppingBag, FiSmartphone, FiTrendingUp } from 'react-icons/fi'

import { formatCurrency } from '../../utils/orderFormatters.js'

const cards = [
  { key: 'totalSales', label: "Today's Sales", icon: FiTrendingUp, color: 'bg-primary-light text-primary-dark', helper: "Today's generated bills", currency: true },
  { key: 'paidAmount', label: "Today's Paid Amount", icon: FiCheckCircle, color: 'bg-emerald-50 text-emerald-700', helper: "Today's collections", currency: true },
  { key: 'dueAmount', label: "Today's Due Amount", icon: FiAlertCircle, color: 'bg-rose-50 text-rose-700', helper: "Today's outstanding", currency: true },
  { key: 'cashSales', label: 'Cash Sales', icon: FiDollarSign, color: 'bg-amber-50 text-amber-700', helper: "Today's cash bills", currency: true },
  { key: 'upiSales', label: 'UPI Sales', icon: FiSmartphone, color: 'bg-violet-50 text-violet-700', helper: "Today's UPI bills", currency: true },
  { key: 'cardSales', label: 'Card Sales', icon: FiCreditCard, color: 'bg-blue-50 text-blue-700', helper: "Today's card bills", currency: true },
  { key: 'totalOrders', label: 'Total Orders', icon: FiShoppingBag, color: 'bg-cyan-50 text-cyan-700', helper: "Today's bills", currency: false },
]

function SalesSummary({ summary, loading }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
      {cards.map(({ key, label, icon: Icon, color, helper, currency }) => (
        <article key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 sm:p-5">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-medium text-slate-500">{label}</p><p className={`mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 ${loading ? 'animate-pulse text-slate-300' : ''}`}>{loading ? '—' : currency ? formatCurrency(summary[key]) : Number(summary[key] || 0)}</p></div><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}><Icon className="text-lg" /></span></div>
          <p className="mt-3 text-xs text-slate-400">{helper}</p>
        </article>
      ))}
    </section>
  )
}

export default SalesSummary
