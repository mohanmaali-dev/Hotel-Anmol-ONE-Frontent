import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

const orderStatusClasses = {
  Completed: 'text-emerald-700',
  Cancelled: 'text-rose-700',
  Ready: 'text-blue-700',
  Preparing: 'text-amber-700',
  Pending: 'text-slate-700',
}

const paymentStatusClasses = {
  Paid: 'text-emerald-700',
  Partial: 'text-amber-700',
  'Not Paid': 'text-rose-700',
}

function PrintableOrder({ order, billerName, settings }) {
  const restaurant = settings.restaurant
  const currency = restaurant.currency

  return (
    <article className="print-bill hidden text-slate-900 print:block">
      <header className="flex items-start justify-between gap-8 border-b-2 border-primary pb-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-white">R</span>
          <div>
            <h1 className="text-xl font-bold leading-tight">{restaurant.name || 'Restaurant'}</h1>
            {restaurant.address && <p className="mt-1 max-w-md text-[10px] leading-4 text-slate-600">{restaurant.address}</p>}
            <p className="mt-1 text-[10px] text-slate-600">{[restaurant.phone, restaurant.email].filter(Boolean).join(' · ')}</p>
            {restaurant.gstTaxNumber && <p className="mt-1 text-[10px] font-semibold text-slate-700">GST / Tax No.: {restaurant.gstTaxNumber}</p>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-dark">Order Details</p>
          <p className="mt-1 text-lg font-bold">#{order.orderNo}</p>
          <p className="mt-1 text-[10px] text-slate-500">{formatOrderDate(order.date, true)}</p>
        </div>
      </header>

      <section className="grid grid-cols-3 gap-x-8 gap-y-3 border-b border-slate-200 py-4">
        {[
          ['Customer', order.customerName || '—', ''],
          ['Order Type', order.orderType || '—', ''],
          ['Area / Room', [order.areaType, order.areaRoomNo].filter(Boolean).join(' · ') || '—', ''],
          ['Biller', billerName, ''],
          ['Order Status', order.orderStatus, orderStatusClasses[order.orderStatus]],
          ['Payment Status', order.paymentStatus, paymentStatusClasses[order.paymentStatus]],
        ].map(([label, value, color]) => (
          <div key={label}>
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className={`mt-1 text-[10px] font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </section>

      <section className="pt-4">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide">Order Items</h2>
        <table className="w-full border-collapse text-left text-[10px]">
          <thead className="print-table-header">
            <tr className="border-y border-slate-200 bg-slate-50 text-[8px] font-bold uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Item Name</th>
              <th className="w-16 px-2 py-2 text-center">Qty</th>
              <th className="w-28 px-2 py-2 text-right">Rate</th>
              <th className="w-28 px-2 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={item.id || `${item.menuItemId}-${index}`} className="print-table-row border-b border-slate-100">
                <td className="px-2 py-2"><p className="font-semibold">{item.name}</p>{item.servingSize && <p className="text-[8px] text-slate-500">{item.servingSize}</p>}</td>
                <td className="px-2 py-2 text-center text-slate-600">{item.quantity}</td>
                <td className="px-2 py-2 text-right text-slate-600">{formatCurrency(item.rate, currency)}</td>
                <td className="px-2 py-2 text-right font-bold">{formatCurrency(item.amount, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="print-summary mt-5 grid grid-cols-2 gap-10">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide">Order Information</h2>
          <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 text-[10px]">
            <div><p className="text-[8px] uppercase text-slate-400">Payment Type</p><p className="mt-1 font-bold">{order.paymentType || '—'}</p></div>
            <div><p className="text-[8px] uppercase text-slate-400">Payment Status</p><p className={`mt-1 font-bold ${paymentStatusClasses[order.paymentStatus]}`}>{order.paymentStatus}</p></div>
            <div><p className="text-[8px] uppercase text-slate-400">Order Status</p><p className={`mt-1 font-bold ${orderStatusClasses[order.orderStatus]}`}>{order.orderStatus}</p></div>
            <div><p className="text-[8px] uppercase text-slate-400">Total Items</p><p className="mt-1 font-bold">{order.items.reduce((total, item) => total + Number(item.quantity || 0), 0)}</p></div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[10px]">
          <div className="flex justify-between gap-5 py-1"><span className="text-slate-500">Subtotal</span><strong>{formatCurrency(order.subtotal, currency)}</strong></div>
          <div className="flex justify-between gap-5 py-1"><span className="text-slate-500">Discount</span><strong className="text-emerald-700">- {formatCurrency(order.discount, currency)}</strong></div>
          <div className="flex justify-between gap-5 py-1"><span className="text-slate-500">Additional Charges</span><strong>{formatCurrency(order.additionalCharges, currency)}</strong></div>
          <div className="mt-2 flex items-center justify-between gap-5 border-t border-slate-300 pt-2"><span className="font-bold">Final Amount</span><strong className="text-sm text-primary-dark">{formatCurrency(order.finalAmount, currency)}</strong></div>
        </div>
      </section>

      <footer className="mt-5 border-t border-slate-200 pt-3 text-center text-[9px] text-slate-500">
        {settings.billing.footerMessage || 'Thank you for dining with us!'}
      </footer>
    </article>
  )
}

export default PrintableOrder
