import { FiAlertCircle, FiCalendar, FiDollarSign, FiTrendingUp } from 'react-icons/fi'

import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${color}`}><Icon /></span>
      </div>
    </article>
  )
}

function SupplierSummary({ supplier }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Total Purchase Amount" value={formatCurrency(supplier.totalPurchaseAmount)} icon={FiTrendingUp} color="bg-primary-light text-primary-dark" />
      <SummaryCard label="Total Paid" value={formatCurrency(supplier.totalPaid)} icon={FiDollarSign} color="bg-emerald-50 text-emerald-700" />
      <SummaryCard label="Total Due" value={formatCurrency(supplier.totalDue)} icon={FiAlertCircle} color="bg-rose-50 text-rose-700" />
      <SummaryCard label="Last Purchase Date" value={supplier.lastPurchaseDate ? formatOrderDate(supplier.lastPurchaseDate) : 'No purchases'} icon={FiCalendar} color="bg-blue-50 text-blue-700" />
    </section>
  )
}

export default SupplierSummary
