import { formatCurrency, getCurrencySymbol } from '../../utils/orderFormatters.js'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-right text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

function PurchaseSummary({ subtotal, discount, additionalCharges, finalAmount, onChange }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <h2 className="font-bold text-slate-900">Purchase Summary</h2>
      <p className="mt-0.5 text-xs text-slate-500">Purchase total and adjustments</p>

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
        </div>

        <label className="grid grid-cols-[1fr_130px] items-center gap-4 text-sm">
          <span className="text-slate-500">Discount</span>
          <span className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{getCurrencySymbol()}</span>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(event) => onChange('discount', event.target.value)}
              className={`${inputClass} pl-7`}
            />
          </span>
        </label>

        <label className="grid grid-cols-[1fr_130px] items-center gap-4 text-sm">
          <span className="text-slate-500">Additional Charges</span>
          <span className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{getCurrencySymbol()}</span>
            <input
              type="number"
              min="0"
              value={additionalCharges}
              onChange={(event) => onChange('additionalCharges', event.target.value)}
              className={`${inputClass} pl-7`}
            />
          </span>
        </label>

        <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
          <span className="font-bold text-slate-900">Final Amount</span>
          <span className="text-xl font-bold text-primary-dark">{formatCurrency(finalAmount)}</span>
        </div>
      </div>
    </section>
  )
}

export default PurchaseSummary
