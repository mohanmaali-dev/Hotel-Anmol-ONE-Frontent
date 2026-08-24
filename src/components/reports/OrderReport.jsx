import { FiCheckCircle, FiCoffee, FiHome, FiShoppingBag, FiSlash } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'
import ReportSummary from './ReportSummary.jsx'

function OrderReport({ summary = {}, rows = [] }) {
  return <div className="space-y-5">
    <ReportSummary items={[
      { label: 'Total Orders', value: summary.totalOrders || 0, icon: FiShoppingBag },
      { label: 'Dine In', value: summary.dineInOrders || 0, icon: FiCoffee, color: 'bg-orange-50 text-orange-700' },
      { label: 'Parcel', value: summary.parcelOrders || 0, icon: FiShoppingBag, color: 'bg-blue-50 text-blue-700' },
      { label: 'Room Orders', value: summary.roomOrders || 0, icon: FiHome, color: 'bg-violet-50 text-violet-700' },
      { label: 'Completed', value: summary.completedOrders || 0, icon: FiCheckCircle, color: 'bg-emerald-50 text-emerald-700' },
      { label: 'Cancelled', value: summary.cancelledOrders || 0, icon: FiSlash, color: 'bg-rose-50 text-rose-700' },
    ]} />
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Order Details</h2><p className="mt-0.5 text-xs text-slate-500">Orders matching your selected dates and filters</p></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Order No.</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Order Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Payment</th><th className="px-5 py-3 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((order) => <tr key={order._id || order.id} className="text-slate-700"><td className="px-5 py-3.5">{(order._id || order.id) ? <Link to={`/orders/${order._id || order.id}`} className="record-link" title="View order details">{order.orderNo}</Link> : order.orderNo}</td><td className="whitespace-nowrap px-4 py-3.5">{formatOrderDate(order.date)}</td><td className="px-4 py-3.5">{order.customerName}</td><td className="px-4 py-3.5">{order.orderType}</td><td className="px-4 py-3.5">{order.orderStatus}</td><td className="px-4 py-3.5"><span className="font-medium">{order.paymentType}</span><span className="block text-xs text-slate-500">{order.paymentStatus}</span></td><td className="px-5 py-3.5 text-right font-medium">{formatCurrency(order.finalAmount)}</td></tr>)}{!rows.length && <tr><td colSpan="7" className="px-5 py-10 text-center text-slate-500">No orders match the selected filters.</td></tr>}</tbody></table></div></section>
  </div>
}

export default OrderReport
