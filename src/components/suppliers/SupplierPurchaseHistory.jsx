import { FiEye, FiShoppingCart } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

const paymentClasses = {
  Paid: 'bg-emerald-50 text-emerald-700',
  Partial: 'bg-amber-50 text-amber-700',
  'Not Paid': 'bg-rose-50 text-rose-700',
}

const purchaseClasses = {
  Draft: 'bg-slate-100 text-slate-700',
  Ordered: 'bg-blue-50 text-blue-700',
  Received: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-rose-50 text-rose-700',
}

function SupplierPurchaseHistory({ purchases }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-900">Purchase History</h2>
        <p className="mt-0.5 text-xs text-slate-500">{purchases.length} related purchases</p>
      </div>
      {purchases.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead><tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">Purchase No.</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Total Amount</th><th className="px-4 py-3 text-right">Paid Amount</th><th className="px-4 py-3 text-right">Due Amount</th><th className="px-4 py-3">Payment Status</th><th className="px-4 py-3">Purchase Status</th><th className="px-5 py-3 text-center">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="text-sm text-slate-600 hover:bg-slate-50/70">
                  <td className="px-5 py-4"><Link to={`/purchases/${purchase.id}`} className="record-link" title="View purchase details">#{purchase.purchaseNo}</Link></td>
                  <td className="px-4 py-4">{formatOrderDate(purchase.purchaseDate)}</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-800">{formatCurrency(purchase.finalAmount)}</td>
                  <td className="px-4 py-4 text-right font-semibold text-emerald-700">{formatCurrency(purchase.paidAmount)}</td>
                  <td className="px-4 py-4 text-right font-semibold text-rose-700">{formatCurrency(purchase.dueAmount)}</td>
                  <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${paymentClasses[purchase.paymentStatus]}`}>{purchase.paymentStatus}</span></td>
                  <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${purchaseClasses[purchase.purchaseStatus]}`}>{purchase.purchaseStatus}</span></td>
                  <td className="px-5 py-4 text-center"><Link to={`/purchases/${purchase.id}`} title="View Purchase" aria-label={`View ${purchase.purchaseNo}`} className="inline-grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><FiEye /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid place-items-center px-6 py-14 text-center"><FiShoppingCart className="text-2xl text-slate-400" /><p className="mt-3 font-semibold text-slate-700">No purchases yet</p><p className="mt-1 text-sm text-slate-500">New purchases for this supplier will appear here.</p></div>
      )}
    </section>
  )
}

export default SupplierPurchaseHistory
