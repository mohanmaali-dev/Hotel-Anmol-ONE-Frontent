import { FiClock } from 'react-icons/fi'

import { formatCurrency, formatOrderDate } from '../utils/orderFormatters.js'

function PaymentHistoryCard({ history = [] }) {
  if (!history.length) return null

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-center gap-2">
        <FiClock className="text-primary" />
        <div><h3 className="font-bold text-slate-900">Payment Changes</h3><p className="mt-0.5 text-xs text-slate-500">Recent updates to this payment</p></div>
      </div>
      <div className="mt-4 space-y-3">
        {history.slice(0, 5).map((entry) => (
          <div key={entry._id || entry.id} className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
            <div className="flex items-center justify-between gap-3"><span className="font-semibold text-slate-800">{formatCurrency(entry.previousPaidAmount)} → {formatCurrency(entry.paidAmount)}</span><span className="text-xs text-slate-400">{formatOrderDate(entry.createdAt)}</span></div>
            <p className="mt-1 text-xs text-slate-500">{entry.reason || 'Payment updated'}{entry.changedBy?.name ? ` · ${entry.changedBy.name}` : ''}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default PaymentHistoryCard
