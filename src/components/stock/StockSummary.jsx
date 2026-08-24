import { FiAlertTriangle, FiBox, FiDollarSign, FiXCircle } from 'react-icons/fi'

import { formatCurrency } from '../../utils/orderFormatters.js'

const cards = [
  { key: 'items', label: 'Total Stock Items', icon: FiBox, color: 'bg-blue-50 text-blue-700' },
  { key: 'value', label: 'Total Stock Value', icon: FiDollarSign, color: 'bg-primary-light text-primary-dark' },
  { key: 'low', label: 'Low Stock Items', icon: FiAlertTriangle, color: 'bg-amber-50 text-amber-700' },
  { key: 'out', label: 'Out of Stock Items', icon: FiXCircle, color: 'bg-rose-50 text-rose-700' },
]

function StockSummary({ summary, loading }) {
  const values = {
    items: summary.totalStockItems || 0,
    value: summary.totalStockValue || 0,
    low: summary.lowStockItems || 0,
    out: summary.outOfStockItems || 0,
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color }) => (
        <article
          key={key}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {loading ? '—' : key === 'value' ? formatCurrency(values[key]) : values[key]}
              </p>
            </div>
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${color}`}>
              <Icon className="text-xl" />
            </span>
          </div>
        </article>
      ))}
    </section>
  )
}

export default StockSummary
