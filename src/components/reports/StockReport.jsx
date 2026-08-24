import {
  FiAlertCircle,
  FiArrowDown,
  FiArrowUp,
  FiBox,
  FiDollarSign,
  FiSlash,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { formatCurrency } from '../../utils/orderFormatters.js'
import ReportSummary from './ReportSummary.jsx'

function statusClass(status) {
  if (status === 'In Stock') return 'bg-emerald-50 text-emerald-700'
  if (status === 'Low Stock') return 'bg-amber-50 text-amber-700'
  return 'bg-rose-50 text-rose-700'
}

function StockReport({ summary = {}, rows = [] }) {
  return (
    <div className="space-y-5">
      <ReportSummary
        items={[
          { label: 'Total Stock Items', value: summary.totalStockItems || 0, icon: FiBox },
          { label: 'Total Stock Value', value: formatCurrency(summary.totalStockValue), icon: FiDollarSign, color: 'bg-blue-50 text-blue-700' },
          { label: 'Low Stock Items', value: summary.lowStockItems || 0, icon: FiAlertCircle, color: 'bg-amber-50 text-amber-700' },
          { label: 'Out of Stock Items', value: summary.outOfStockItems || 0, icon: FiSlash, color: 'bg-rose-50 text-rose-700' },
          { label: 'Stock In', value: summary.totalStockIn || 0, icon: FiArrowDown, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Stock Out', value: summary.totalStockOut || 0, icon: FiArrowUp, color: 'bg-orange-50 text-orange-700' },
        ]}
      />
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Current Stock Details</h2>
          <p className="mt-0.5 text-xs text-slate-500">Stock movement totals use the selected date range</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3">Item</th><th className="px-4 py-3">Category</th><th className="px-4 py-3 text-right">Quantity</th><th className="px-4 py-3 text-right">Stock Value</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((item) => (
                <tr key={item._id || item.id} className="text-slate-700">
                  <td className="px-5 py-3.5">{(item._id || item.id) ? <Link to={`/stock/history?item=${item._id || item.id}`} className="record-link" title="View stock history">{item.itemName || item.name}</Link> : item.itemName || item.name}</td>
                  <td className="px-4 py-3.5">{item.category}</td>
                  <td className="px-4 py-3.5 text-right">{item.currentQuantity} {item.unit}</td>
                  <td className="px-4 py-3.5 text-right font-medium">{formatCurrency(item.stockValue)}</td>
                  <td className="px-5 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(item.status)}`}>{item.status}</span></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-500">No stock items match the selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default StockReport
