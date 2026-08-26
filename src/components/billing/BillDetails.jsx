import { FiCoffee } from 'react-icons/fi'

import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  )
}

function BillDetails({ bill, restaurantName = 'Restaurant', currency = 'INR' }) {
  return (
    <section className="print-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="flex flex-col justify-between gap-5 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-white">
            <FiCoffee className="text-lg" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{restaurantName}</h2>
            <p className="text-xs text-slate-500">Restaurant Bill</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">Invoice</p>
          <p className="mt-1 text-lg font-bold text-slate-900">#{bill.billNo}</p>
          <p className="mt-0.5 text-xs text-slate-500">{formatOrderDate(bill.date, true)}</p>
        </div>
      </div>

      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <h3 className="font-bold text-slate-900">Order Information</h3>
        <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          <DetailItem label="Order No." value={`#${bill.orderNo}`} />
          <DetailItem label="Customer" value={bill.customerName} />
          <DetailItem label="Order Type" value={bill.orderType} />
          <DetailItem label="Area Type" value={bill.areaType} />
          <DetailItem label="Area / Room" value={bill.areaRoomNo} />
          <DetailItem label="Biller" value={bill.billerName || (bill.biller ? 'Assigned user' : '—')} />
        </div>
      </div>

      <div className="px-5 py-4 sm:px-6">
        <h3 className="font-bold text-slate-900">Order Items</h3>
        <p className="mt-0.5 text-xs text-slate-500">Items generated from the original order</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Item Name</th>
              <th className="px-4 py-3 text-center">Quantity</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bill.items.map((item, index) => (
              <tr key={item.id || `${item.menuItemId}-${index}`} className="text-sm text-slate-600">
                <td className="px-6 py-4"><p className="font-semibold text-slate-800">{item.name}</p>{item.servingSize && <p className="mt-0.5 text-xs text-slate-500">{item.servingSize}</p>}</td>
                <td className="px-4 py-4 text-center">{item.quantity}</td>
                <td className="px-4 py-4 text-right">{formatCurrency(item.rate, currency)}</td>
                <td className="px-6 py-4 text-right font-semibold text-slate-800">
                  {formatCurrency(item.amount, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default BillDetails
