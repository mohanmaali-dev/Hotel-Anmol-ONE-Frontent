import { useState } from 'react'
import { FiAlertCircle, FiArrowUp, FiX } from 'react-icons/fi'

import DatePickerField from '../DatePickerField.jsx'
import { validateStockOutForm } from '../../utils/stockFormValidation.js'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

const reasons = ['Kitchen Usage', 'Wastage', 'Damage', 'Adjustment', 'Other']

function todayDate() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function StockOutForm({ items, selectedItemId, onSubmit, onCancel, submitting }) {
  const selectedItem = items.find((item) => item.id === selectedItemId) || items[0]
  const [form, setForm] = useState({
    itemId: selectedItem?.id || '',
    quantity: 1,
    reason: reasons[0],
    reference: '',
    date: todayDate(),
    note: '',
  })
  const [error, setError] = useState('')
  const activeItem = items.find((item) => item.id === form.itemId)

  const updateForm = (field, value) => {
    setError('')
    setForm((current) => {
      if (field === 'itemId') {
        return { ...current, itemId: value }
      }
      return { ...current, [field]: value }
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const quantity = Number(form.quantity)
    const validationError = validateStockOutForm(form, activeItem)
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    onSubmit({ ...form, quantity, date: `${form.date}T12:00:00.000Z` })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <FiArrowUp className="text-rose-600" /> Stock Out
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">Decrease stock without going below zero.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close Stock Out form"
          className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
        >
          <FiX />
        </button>
      </div>

      {error && <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700"><FiAlertCircle className="shrink-0" /><span className="flex-1">{error}</span><button type="button" onClick={() => setError('')} aria-label="Close error"><FiX /></button></div>}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Item</span>
          <select
            value={form.itemId}
            onChange={(event) => updateForm('itemId', event.target.value)}
            className={inputClass}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            Available: {activeItem?.currentQuantity || 0} {activeItem?.unit}
          </p>
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Quantity ({activeItem?.unit})</span>
          <input
            type="number"
            min="0.001"
            step="0.001"
            value={form.quantity}
            onChange={(event) => updateForm('quantity', event.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Reason</span>
          <select
            value={form.reason}
            onChange={(event) => updateForm('reason', event.target.value)}
            className={inputClass}
          >
            {reasons.map((reason) => (
              <option key={reason}>{reason}</option>
            ))}
          </select>
        </label>
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Date</span>
          <DatePickerField fullYear ariaLabel="Stock Out Date" value={form.date} onChange={(value) => updateForm('date', value)} />
        </div>
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Reference</span>
          <input type="text" value={form.reference} onChange={(event) => updateForm('reference', event.target.value)} placeholder="Optional reference" className={inputClass} />
        </label>
        <label className="sm:col-span-2 xl:col-span-4">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Note</span>
          <input
            type="text"
            value={form.note}
            onChange={(event) => updateForm('note', event.target.value)}
            placeholder="Optional note"
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={submitting || !activeItem?.currentQuantity}
          className="flex h-10 items-center gap-2 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiArrowUp /> {submitting ? 'Removing...' : 'Remove Stock'}
        </button>
      </div>
    </form>
  )
}

export default StockOutForm
