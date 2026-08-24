import { FiCalendar, FiDollarSign, FiTrendingDown } from 'react-icons/fi'

import { formatCurrency } from '../../utils/orderFormatters.js'

const cards = [
  { key: 'todayExpenses', label: "Today's Expenses", icon: FiCalendar, color: 'bg-rose-50 text-rose-700' },
  { key: 'monthExpenses', label: 'This Month Expenses', icon: FiTrendingDown, color: 'bg-amber-50 text-amber-700' },
  { key: 'totalExpenses', label: 'Total Expenses', icon: FiDollarSign, color: 'bg-primary-light text-primary-dark' },
]

function ExpenseSummary({ totals, loading = false }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map(({ key, label, icon: Icon, color }) => (
        <article key={key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{loading ? '—' : formatCurrency(totals[key])}</p></div>
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${color}`}><Icon className="text-xl" /></span>
          </div>
        </article>
      ))}
    </section>
  )
}

export default ExpenseSummary
