import { FiEye, FiFileText } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

const statusClasses = {
  Paid: 'bg-emerald-50 text-emerald-700',
  'Not Paid': 'bg-rose-50 text-rose-700',
  Partial: 'bg-amber-50 text-amber-700',
}

const statusDots = {
  Paid: 'bg-emerald-500',
  'Not Paid': 'bg-rose-500',
  Partial: 'bg-amber-500',
}

function BillingTable({ bills, total, loading, hasFilters, canViewOrders }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-900">All Bills</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {loading && bills.length
            ? 'Updating bills...'
            : `${total} ${total === 1 ? 'bill' : 'bills'} found`}
        </p>
      </div>

      {loading && !bills.length ? (
        <div className="grid place-items-center px-6 py-16"><span className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading bills...</p></div>
      ) : bills.length ? (
        <div className={`overflow-x-auto transition-opacity ${loading ? 'pointer-events-none opacity-60' : ''}`} aria-busy={loading}>
          <table className="w-full min-w-[1450px] text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Bill No.</th>
                <th className="px-4 py-3">Order No.</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Order Type</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-right">Discount</th>
                <th className="px-4 py-3 text-right">Additional Charges</th>
                <th className="px-4 py-3 text-right">Final Amount</th>
                <th className="px-4 py-3">Payment Type</th>
                <th className="px-4 py-3">Payment Status</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.map((bill) => (
                <tr key={bill.id} className="text-sm text-slate-600 hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-primary-dark">
                    <Link to={`/billing/${bill.id}`} className="record-link" title="View bill details">
                      #{bill.billNo}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                    {bill.orderId && canViewOrders ? <Link to={`/orders/${bill.orderId}`} className="record-link" title="View related order">#{bill.orderNo}</Link> : `#${bill.orderNo}`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{formatOrderDate(bill.date, true)}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                    {bill.customerName || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{bill.orderType}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    {formatCurrency(bill.subtotal)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    {formatCurrency(bill.discount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    {formatCurrency(bill.additionalCharges)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-slate-800">
                    {formatCurrency(bill.finalAmount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{bill.paymentType || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[bill.paymentStatus]}`}
                    >
                      <span className={`size-1.5 rounded-full ${statusDots[bill.paymentStatus]}`} />
                      {bill.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Link
                      to={`/billing/${bill.id}`}
                      aria-label={`View ${bill.billNo}`}
                      title="View bill"
                      className="inline-grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-primary/30 hover:bg-primary-light hover:text-primary-dark"
                    >
                      <FiEye />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid place-items-center px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-xl text-slate-400">
            <FiFileText />
          </span>
          <p className="mt-3 font-semibold text-slate-700">No bills found</p>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters
              ? 'Try changing or clearing the filters.'
              : 'Bills will appear here after they are generated from orders.'}
          </p>
        </div>
      )}
    </section>
  )
}

export default BillingTable
