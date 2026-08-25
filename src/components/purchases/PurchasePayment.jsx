import { FiSave } from 'react-icons/fi'

import { formatCurrency } from '../../utils/orderFormatters.js'

const statusClasses = {
  Paid: 'bg-emerald-50 text-emerald-700',
  Partial: 'bg-amber-50 text-amber-700',
  'Not Paid': 'bg-rose-50 text-rose-700',
}

function PurchasePayment({ paymentType, paidAmount, savedPaymentType, savedPaidAmount, finalAmount, paymentStatus: serverStatus, dueAmount: serverDueAmount, onChange, onUpdate, updating = false, disabled = false }) {
  const numericPaidAmount = Math.max(0, Number(paidAmount) || 0)
  const tracksSavedPayment = savedPaymentType !== undefined || savedPaidAmount !== undefined
  const hasChanges = !tracksSavedPayment || paymentType !== savedPaymentType || numericPaidAmount !== Number(savedPaidAmount || 0)
  const previewDueAmount = Math.max(0, finalAmount - numericPaidAmount)
  const previewStatus = numericPaidAmount <= 0 ? 'Not Paid' : numericPaidAmount < finalAmount ? 'Partial' : 'Paid'
  const dueAmount = hasChanges ? previewDueAmount : serverDueAmount ?? previewDueAmount
  const paymentStatus = hasChanges ? previewStatus : serverStatus || previewStatus

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900">Payment</h2>
          <p className="mt-0.5 text-xs text-slate-500">Payment method and current balance</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[paymentStatus]}`}>
          {paymentStatus}
        </span>
      </div>

      <fieldset className="mt-5" disabled={disabled || updating}>
        <legend className="mb-2 text-sm font-semibold text-slate-700">Payment Type</legend>
        <div className="grid grid-cols-3 gap-2">
          {['Cash', 'UPI', 'Card'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange('paymentType', type)}
              className={`h-10 rounded-lg border text-sm font-semibold ${
                paymentType === type
                  ? 'border-primary bg-primary-light text-primary-dark'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Paid Amount</span>
        <span className="relative block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
          <input
            type="number"
            min="0"
            max={finalAmount}
            value={paidAmount}
            disabled={disabled || updating}
            onChange={(event) => onChange('paidAmount', event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </span>
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
        <div>
          <p className="text-xs text-slate-500">Paid Amount</p>
          <p className="mt-1 font-bold text-emerald-700">{formatCurrency(numericPaidAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Due Amount</p>
          <p className="mt-1 font-bold text-rose-700">{formatCurrency(dueAmount)}</p>
        </div>
      </div>

      {onUpdate && (
        <button
          type="button"
          onClick={onUpdate}
          disabled={disabled || updating || !hasChanges}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiSave /> {updating ? 'Updating...' : 'Update Payment'}
        </button>
      )}
    </section>
  )
}

export default PurchasePayment
