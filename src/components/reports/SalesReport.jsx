import { FiAlertCircle, FiCreditCard, FiDollarSign, FiShoppingBag, FiTrendingUp } from 'react-icons/fi'

import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'
import ReportSummary from './ReportSummary.jsx'

function SalesReport({ summary = {}, rows = [] }) {
  return <div className="space-y-5">
    <ReportSummary items={[
      { label: 'Total Sales', value: formatCurrency(summary.totalSales), icon: FiTrendingUp },
      { label: 'Paid Amount', value: formatCurrency(summary.paidAmount), icon: FiDollarSign, color: 'bg-emerald-50 text-emerald-700' },
      { label: 'Due Amount', value: formatCurrency(summary.dueAmount), icon: FiAlertCircle, color: 'bg-amber-50 text-amber-700' },
      { label: 'Cash Sales', value: formatCurrency(summary.cashSales), icon: FiDollarSign, color: 'bg-blue-50 text-blue-700' },
      { label: 'UPI Sales', value: formatCurrency(summary.upiSales), icon: FiCreditCard, color: 'bg-violet-50 text-violet-700' },
      { label: 'Card Sales', value: formatCurrency(summary.cardSales), icon: FiCreditCard, color: 'bg-cyan-50 text-cyan-700' },
      { label: 'Total Orders', value: summary.totalOrders || 0, icon: FiShoppingBag, color: 'bg-orange-50 text-orange-700' },
    ]} />
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Date-wise Sales</h2><p className="mt-0.5 text-xs text-slate-500">Daily sales for the selected dates</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Date</th><th className="px-4 py-3 text-center">Orders</th><th className="px-4 py-3 text-right">Total Sales</th><th className="px-4 py-3 text-right">Paid</th><th className="px-5 py-3 text-right">Due</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.date} className="text-slate-700"><td className="px-5 py-3.5 font-semibold text-slate-900">{formatOrderDate(row.date)}</td><td className="px-4 py-3.5 text-center">{row.totalOrders}</td><td className="px-4 py-3.5 text-right font-medium">{formatCurrency(row.totalSales)}</td><td className="px-4 py-3.5 text-right text-emerald-700">{formatCurrency(row.paidAmount)}</td><td className="px-5 py-3.5 text-right text-amber-700">{formatCurrency(row.dueAmount)}</td></tr>)}{!rows.length && <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">No sales match the selected filters.</td></tr>}</tbody></table></div></section>
  </div>
}

export default SalesReport
