import { FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { formatCurrency } from '../../utils/orderFormatters.js'

const orderTypeClasses = {
  'Dine In': 'bg-blue-50 text-blue-700',
  Parcel: 'bg-amber-50 text-amber-700',
  Room: 'bg-violet-50 text-violet-700',
}

function RecentOrders({ orders, loading, fullWidth = false }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40 ${fullWidth ? 'xl:col-span-3' : 'xl:col-span-2'}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
        <div>
          <h2 className="font-bold text-slate-900">Recent Orders</h2>
          <p className="mt-0.5 text-xs text-slate-500">Latest restaurant orders</p>
        </div>
        <Link
          to="/orders"
          className="flex items-center gap-1.5 text-sm font-semibold text-primary-dark hover:text-primary"
        >
          View all <FiArrowRight />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Order No.</th>
              <th className="px-4 py-3">Order Type</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment Type</th>
              <th className="px-5 py-3">Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && orders.map((order) => (
              <tr key={order.orderNo} className="text-sm text-slate-600 hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                  <Link to={`/orders/${order.id}`} className="hover:text-primary-dark">{order.orderNo}</Link>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${orderTypeClasses[order.orderType]}`}
                  >
                    {order.orderType}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                  {order.customerName}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">
                  {formatCurrency(order.finalAmount)}
                </td>
                <td className="whitespace-nowrap px-4 py-4">{order.paymentType || '—'}</td>
                <td className="whitespace-nowrap px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : order.paymentStatus === 'Partial' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        order.paymentStatus === 'Paid' ? 'bg-emerald-500' : order.paymentStatus === 'Partial' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                    {order.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
            {loading && <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">Loading recent orders...</td></tr>}
            {!loading && !orders.length && <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default RecentOrders
