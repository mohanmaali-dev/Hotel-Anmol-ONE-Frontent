import { FiCreditCard, FiFileText, FiShoppingBag, FiUser } from 'react-icons/fi'

import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

const statusClasses = {
  Paid: 'bg-emerald-50 text-emerald-700',
  'Not Paid': 'bg-rose-50 text-rose-700',
  Partial: 'bg-amber-50 text-amber-700',
}

function DetailItem({ label, value, valueClass = 'text-slate-800' }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1.5 text-sm font-semibold ${valueClass}`}>{value || '—'}</p>
    </div>
  )
}

function InfoSection({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark">
          <Icon />
        </span>
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">{children}</div>
    </section>
  )
}

function SaleDetails({ sale }) {
  const moneyOrDash = (value) => (value === null || value === undefined ? '—' : formatCurrency(value))

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-dark">Sale Record</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">#{sale.saleNo}</h2>
            <p className="mt-1 text-sm text-slate-500">{formatOrderDate(sale.date, true)}</p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses[sale.paymentStatus]}`}>
            {sale.paymentStatus}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <InfoSection title="Order Information" icon={FiShoppingBag}>
          <DetailItem label="Order No." value={`#${sale.orderNo}`} />
          <DetailItem label="Order Type" value={sale.orderType} />
          <DetailItem label="Customer" value={sale.customerName} />
          <DetailItem label="Area Type" value={sale.areaType} />
          <DetailItem label="Area / Room" value={sale.areaRoomNo} />
        </InfoSection>

        <InfoSection title="Bill Information" icon={FiFileText}>
          <DetailItem label="Bill No." value={`#${sale.billNo}`} />
          <DetailItem label="Bill Date" value={formatOrderDate(sale.date, true)} />
          <DetailItem label="Subtotal" value={moneyOrDash(sale.subtotal)} />
          <DetailItem label="Final Amount" value={formatCurrency(sale.finalAmount)} />
        </InfoSection>

        <InfoSection title="Payment Information" icon={FiCreditCard}>
          <DetailItem label="Payment Type" value={sale.paymentType} />
          <DetailItem label="Status" value={sale.paymentStatus} />
          <DetailItem
            label="Paid Amount"
            value={formatCurrency(sale.paidAmount)}
            valueClass="text-emerald-700"
          />
          <DetailItem
            label="Due Amount"
            value={formatCurrency(sale.dueAmount)}
            valueClass="text-rose-700"
          />
        </InfoSection>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-bold text-slate-900">Item Details</h3>
            <p className="mt-0.5 text-xs text-slate-500">Items from the related order</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Item Name</th>
                  <th className="px-4 py-3 text-center">Quantity</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.items.map((item, index) => (
                  <tr key={item.id || `${item.menuItemId}-${index}`} className="text-sm text-slate-600">
                    <td className="px-5 py-4"><p className="font-semibold text-slate-800">{item.name}</p>{item.servingSize && <p className="mt-0.5 text-xs text-slate-500">{item.servingSize}</p>}</td>
                    <td className="px-4 py-4 text-center">{item.quantity}</td>
                    <td className="px-4 py-4 text-right">{formatCurrency(item.rate)}</td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-800">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
                {!sale.items.length && <tr><td colSpan="4" className="px-5 py-10 text-center text-sm text-slate-500">Related bill items are unavailable.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <h3 className="font-bold text-slate-900">Amount Summary</h3>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-800">{moneyOrDash(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Discount</span>
                <span className="font-semibold text-emerald-700">{sale.discount === null || sale.discount === undefined ? '—' : `- ${formatCurrency(sale.discount)}`}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Additional Charges</span>
                <span className="font-semibold text-slate-800">
                  {moneyOrDash(sale.additionalCharges)}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-t border-dashed border-slate-200 pt-3">
                <span className="font-bold text-slate-900">Final Amount</span>
                <span className="font-bold text-primary-dark">{formatCurrency(sale.finalAmount)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Paid Amount</span>
                <span className="font-bold text-emerald-700">{formatCurrency(sale.paidAmount)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Due Amount</span>
                <span className="font-bold text-rose-700">{formatCurrency(sale.dueAmount)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-center gap-2">
              <FiUser className="text-primary-dark" />
              <h3 className="font-bold text-slate-900">Biller</h3>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">{sale.billerName || (sale.biller ? 'Assigned user' : '—')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default SaleDetails
