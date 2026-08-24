import { formatCurrency } from '../../utils/orderFormatters.js'

function BillSummary({ bill, currency = 'INR' }) {
  return (
    <section className="print-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <h3 className="font-bold text-slate-900">Billing Summary</h3>
      <p className="mt-0.5 text-xs text-slate-500">Final total from the order</p>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-semibold text-slate-800">{formatCurrency(bill.subtotal, currency)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Discount</span>
          <span className="font-semibold text-emerald-700">- {formatCurrency(bill.discount, currency)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Additional Charges</span>
          <span className="font-semibold text-slate-800">
            {formatCurrency(bill.additionalCharges, currency)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
          <span className="font-bold text-slate-900">Final Amount</span>
          <span className="text-xl font-bold text-primary-dark">
            {formatCurrency(bill.finalAmount, currency)}
          </span>
        </div>
      </div>
    </section>
  )
}

export default BillSummary
