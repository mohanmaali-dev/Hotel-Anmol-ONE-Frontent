import { useState } from 'react'
import { FiAlertCircle, FiSave, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { expenseCategories } from '../../data/expenseOptions.js'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'

function todayDate() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function ExpenseForm({ initialExpense, onSave, submitting = false, apiError = '', onClearError }) {
  const [form, setForm] = useState({
    date: initialExpense?.date?.slice(0, 10) || todayDate(),
    category: initialExpense?.category || expenseCategories[0],
    amount: initialExpense?.amount || 0,
    paymentType: initialExpense?.paymentType || 'Cash',
    description: initialExpense?.description || '',
    reference: initialExpense?.reference || '',
    notes: initialExpense?.notes || '',
  })
  const [error, setError] = useState('')

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.date || Number(form.amount) <= 0 || !form.description.trim()) {
      setError('Please enter the date, a valid amount, and description.')
      return
    }
    setError('')
    await onSave({
      ...initialExpense,
      ...form,
      amount: Number(form.amount),
      description: form.description.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || apiError) && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"><FiAlertCircle className="mt-0.5 shrink-0" /><span className="flex-1">{error || apiError}</span><button type="button" onClick={() => { setError(''); onClearError?.() }} aria-label="Close error message" className="grid size-6 place-items-center rounded-md hover:bg-rose-100"><FiX /></button></div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
        <h2 className="font-bold text-slate-900">Expense Information</h2>
        <p className="mt-0.5 text-xs text-slate-500">Record a restaurant operating expense</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Date</span><input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} className={inputClass} /></label>
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Expense Category</span><select value={form.category} onChange={(event) => updateForm('category', event.target.value)} className={inputClass}>{expenseCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Amount</span><span className="relative block"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span><input type="number" min="0" value={form.amount} onChange={(event) => updateForm('amount', event.target.value)} className={`${inputClass} pl-8`} /></span></label>

          <fieldset className="sm:col-span-2 xl:col-span-3">
            <legend className="mb-2 text-sm font-semibold text-slate-700">Payment Type</legend>
            <div className="grid max-w-md grid-cols-3 gap-2">
              {['Cash', 'UPI', 'Card'].map((type) => <button key={type} type="button" onClick={() => updateForm('paymentType', type)} className={`h-10 rounded-lg border text-sm font-semibold ${form.paymentType === type ? 'border-primary bg-primary-light text-primary-dark' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{type}</button>)}
            </div>
          </fieldset>

          <label className="sm:col-span-2 xl:col-span-3"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Description</span><textarea rows="3" value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="What was this expense for?" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
          <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Reference / Bill No. <span className="font-normal text-slate-400">(optional)</span></span><input type="text" value={form.reference} onChange={(event) => updateForm('reference', event.target.value)} placeholder="Enter reference" className={inputClass} /></label>
          <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Notes <span className="font-normal text-slate-400">(optional)</span></span><input type="text" value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} placeholder="Optional note" className={inputClass} /></label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link to={initialExpense ? `/expenses/${initialExpense.id}` : '/expenses'} className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</Link>
        <button type="submit" disabled={submitting} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"><FiSave /> {submitting ? 'Saving...' : initialExpense ? 'Update Expense' : 'Save Expense'}</button>
      </div>
    </form>
  )
}

export default ExpenseForm
