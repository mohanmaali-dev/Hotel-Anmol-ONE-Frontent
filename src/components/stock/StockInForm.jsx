import { useState } from 'react'
import { FiArrowDown, FiX } from 'react-icons/fi'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

function todayDate() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function StockInForm({ items, suppliers, selectedItemId, onSubmit, onCancel, submitting }) {
  const selectedItem = items.find((item) => item.id === selectedItemId) || items[0]
  const [form, setForm] = useState({
    itemId: selectedItem?.id || '',
    quantity: 1,
    purchasePrice: selectedItem?.purchasePrice || 0,
    supplierId: selectedItem?.supplierId || '',
    reference: '',
    date: todayDate(),
    note: '',
  })

  const updateForm = (field, value) => {
    if (field === 'itemId') {
      const item = items.find((stockItem) => stockItem.id === value)
      setForm((current) => ({
        ...current,
        itemId: value,
        purchasePrice: item?.purchasePrice || 0,
        supplierId: item?.supplierId || '',
      }))
      return
    }
    setForm((current) => ({ ...current, [field]: value }))
  }

  const activeItem = items.find((item) => item.id === form.itemId)
  const selectableSuppliers = suppliers.filter(
    (supplier) => supplier.isActive || supplier.id === activeItem?.supplierId,
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ ...form, date: `${form.date}T12:00:00.000Z` })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <FiArrowDown className="text-emerald-600" /> Stock In
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">Increase an item&apos;s current stock.</p>
        </div>
        <button type="button" onClick={onCancel} aria-label="Close Stock In form" className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">
          <FiX />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Item</span>
          <select value={form.itemId} onChange={(event) => updateForm('itemId', event.target.value)} className={inputClass}>
            {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Quantity ({activeItem?.unit})</span>
          <input type="number" min="0.001" step="0.001" value={form.quantity} onChange={(event) => updateForm('quantity', event.target.value)} className={inputClass} />
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Price per {activeItem?.unit}</span>
          <input type="number" min="0" value={form.purchasePrice} onChange={(event) => updateForm('purchasePrice', event.target.value)} className={inputClass} />
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Supplier</span>
          <select value={form.supplierId} onChange={(event) => updateForm('supplierId', event.target.value)} className={inputClass}>
            <option value="">Select supplier</option>
            {selectableSuppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Reference / Purchase No.</span>
          <input type="text" value={form.reference} onChange={(event) => updateForm('reference', event.target.value)} placeholder="e.g. PUR-2005" className={inputClass} />
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Date</span>
          <input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} className={inputClass} />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Note</span>
          <input type="text" value={form.note} onChange={(event) => updateForm('note', event.target.value)} placeholder="Optional note" className={inputClass} />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button type="submit" disabled={submitting} className="flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
          <FiArrowDown /> {submitting ? 'Adding...' : 'Add Stock'}
        </button>
      </div>
    </form>
  )
}

export default StockInForm
