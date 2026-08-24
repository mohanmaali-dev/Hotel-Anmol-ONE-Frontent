import { FiEye, FiShoppingCart } from 'react-icons/fi'
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

function SalesTable({ sales, total, loading }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-900">All Sales</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {total} {total === 1 ? 'sale' : 'sales'} found
        </p>
      </div>

      {loading ? (
        <div className="grid place-items-center px-6 py-16"><span className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading sales...</p></div>
      ) : sales.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1480px] text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Sale No.</th>
                <th className="px-4 py-3">Bill No.</th>
                <th className="px-4 py-3">Order No.</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Order Type</th>
                <th className="px-4 py-3">Payment Type</th>
                <th className="px-4 py-3">Payment Status</th>
                <th className="px-4 py-3 text-right">Final Amount</th>
                <th className="px-4 py-3 text-right">Paid Amount</th>
                <th className="px-4 py-3 text-right">Due Amount</th>
                <th className="px-4 py-3">Biller</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((sale) => (
                <tr key={sale.id} className="text-sm text-slate-600 hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-primary-dark">
                    <Link to={`/sales/${sale.id}`} className="record-link" title="View sale details">
                      #{sale.saleNo}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                    {sale.billId ? <Link to={`/billing/${sale.billId}`} className="record-link" title="View related bill">#{sale.billNo}</Link> : `#${sale.billNo}`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{sale.orderId ? <Link to={`/orders/${sale.orderId}`} className="record-link" title="View related order">#{sale.orderNo}</Link> : `#${sale.orderNo}`}</td>
                  <td className="whitespace-nowrap px-4 py-4">{formatOrderDate(sale.date)}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                    {sale.customerName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{sale.orderType}</td>
                  <td className="whitespace-nowrap px-4 py-4">{sale.paymentType}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[sale.paymentStatus]}`}
                    >
                      <span className={`size-1.5 rounded-full ${statusDots[sale.paymentStatus]}`} />
                      {sale.paymentStatus}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-slate-800">
                    {formatCurrency(sale.finalAmount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-emerald-700">
                    {formatCurrency(sale.paidAmount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-rose-700">
                    {formatCurrency(sale.dueAmount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{sale.billerName || (sale.biller ? 'Assigned user' : '—')}</td>
                  <td className="px-5 py-4 text-center">
                    <Link
                      to={`/sales/${sale.id}`}
                      aria-label={`View ${sale.saleNo}`}
                      title="View sale"
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
            <FiShoppingCart />
          </span>
          <p className="mt-3 font-semibold text-slate-700">No sales found</p>
          <p className="mt-1 text-sm text-slate-500">Try changing or clearing the filters.</p>
        </div>
      )}
    </section>
  )
}

export default SalesTable
