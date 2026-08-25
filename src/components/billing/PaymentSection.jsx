import { useEffect, useState } from 'react'
import { FiCheckCircle, FiSave } from 'react-icons/fi'

import { formatCurrency, getCurrencySymbol } from '../../utils/orderFormatters.js'

const statusClasses = {
  Paid: 'bg-emerald-50 text-emerald-700',
  'Not Paid': 'bg-rose-50 text-rose-700',
  Partial: 'bg-amber-50 text-amber-700',
}

function PaymentSection({ bill, onUpdate, updating, canEdit }) {
  const [paymentType, setPaymentType] = useState(bill.paymentType || 'Cash')
  const [paidAmount, setPaidAmount] = useState(String(bill.paidAmount))
  const [reason, setReason] = useState('')

  useEffect(() => {
    setPaymentType(bill.paymentType || 'Cash')
    setPaidAmount(String(bill.paidAmount))
    setReason('')
  }, [bill])

  const numericPaidAmount = Number(paidAmount)
  const amountReduced = numericPaidAmount < Number(bill.paidAmount)
  const hasChanges =
    paidAmount !== '' &&
    (numericPaidAmount !== Number(bill.paidAmount) || paymentType !== (bill.paymentType || 'Cash'))

  const savePayment = async (amount = paidAmount) => {
    const numericAmount = Number(amount)
    await onUpdate({
      paymentType,
      paidAmount: numericAmount,
      reason: numericAmount < Number(bill.paidAmount) ? reason : '',
    })
  }

  return (
    <section className="print-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900">Payment</h3><p className="mt-0.5 text-xs text-slate-500">Update payment for this bill</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[bill.paymentStatus]}`}>{bill.paymentStatus}</span></div>

      <div className="mt-5 hidden grid-cols-2 gap-4 print:grid">
        <div><p className="text-xs uppercase tracking-wide text-slate-400">Payment Type</p><p className="mt-1 font-semibold text-slate-800">{bill.paymentType || '—'}</p></div>
        <div><p className="text-xs uppercase tracking-wide text-slate-400">Paid Amount</p><p className="mt-1 font-semibold text-slate-800">{formatCurrency(bill.paidAmount)}</p></div>
        <div><p className="text-xs uppercase tracking-wide text-slate-400">Due Amount</p><p className="mt-1 font-semibold text-slate-800">{formatCurrency(bill.dueAmount)}</p></div>
        <div><p className="text-xs uppercase tracking-wide text-slate-400">Payment Status</p><p className="mt-1 font-semibold text-slate-800">{bill.paymentStatus}</p></div>
      </div>

      {canEdit ? (
        <div className="mt-5 space-y-5 print:hidden">
          <fieldset disabled={updating}><legend className="mb-2 text-sm font-semibold text-slate-700">Payment Type</legend><div className="grid grid-cols-3 gap-2">{['Cash', 'UPI', 'Card'].map((type) => <button key={type} type="button" onClick={() => setPaymentType(type)} className={`h-10 rounded-lg border text-sm font-semibold ${paymentType === type ? 'border-primary bg-primary-light text-primary-dark' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{type}</button>)}</div></fieldset>
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Paid Amount</span><span className="relative block"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{getCurrencySymbol()}</span><input type="number" min="0" max={bill.finalAmount} step="0.01" value={paidAmount} disabled={updating} onChange={(event) => setPaidAmount(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-50" /></span></label>
          {amountReduced && <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Reason for reducing payment</span><input type="text" value={reason} disabled={updating} onChange={(event) => setReason(event.target.value)} placeholder="For example: entered by mistake" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-50" /></label>}
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm"><div><p className="text-xs text-slate-500">Current Paid</p><p className="mt-1 font-bold text-slate-800">{formatCurrency(bill.paidAmount)}</p></div><div><p className="text-xs text-slate-500">Current Due</p><p className="mt-1 font-bold text-rose-700">{formatCurrency(bill.dueAmount)}</p></div></div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <button type="button" onClick={() => savePayment(bill.finalAmount)} disabled={updating || bill.paymentStatus === 'Paid'} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"><FiCheckCircle /> Mark as Paid</button>
            <button type="button" onClick={() => savePayment()} disabled={updating || !hasChanges || (amountReduced && !reason.trim())} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"><FiSave /> {updating ? 'Updating...' : 'Update Payment'}</button>
          </div>
        </div>
      ) : <p className="mt-5 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500 print:hidden">You have view-only access to payments.</p>}
    </section>
  )
}

export default PaymentSection
