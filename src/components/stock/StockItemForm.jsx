import { useEffect, useState } from 'react'
import { FiAlertCircle, FiFolder, FiSave, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { unitOptions } from '../../data/inventoryOptions.js'
import { useSettings } from '../../context/SettingsContext.jsx'
import StockCategoryManager from './StockCategoryManager.jsx'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

const unitName = (unit) => unit ? unit.charAt(0).toUpperCase() + unit.slice(1) : ''

function StockItemForm({ initialItem, suppliers = [], categories = [], canCreateCategory = false, canEditCategory = false, canDeleteCategory = false, onCategoriesChange, onSave, submitting = false, apiError = '', onClearError }) {
  const { settings } = useSettings()
  const availableSuppliers = suppliers.filter(
    (supplier) => supplier.isActive || supplier.id === initialItem?.supplierId,
  )
  const [form, setForm] = useState({
    name: initialItem?.name || '',
    category: initialItem?.category || categories.find((category) => category.isActive)?.name || '',
    unit: initialItem?.unit || 'piece',
    currentQuantity: initialItem?.currentQuantity || 0,
    purchasePrice: initialItem?.purchasePrice ?? 0,
    minimumStock: initialItem?.minimumStock ?? settings.stock.defaultMinimumStock,
    supplierId: initialItem?.supplierId || '',
  })
  const [error, setError] = useState('')
  const [showCategories, setShowCategories] = useState(false)

  const availableCategories = categories.filter(
    (category) => category.isActive || category.name === initialItem?.category,
  )

  useEffect(() => {
    if (!form.category && availableCategories.length) {
      setForm((current) => ({ ...current, category: availableCategories[0].name }))
    }
  }, [availableCategories, form.category])

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Please enter an item name.')
      return
    }
    if (!form.category) {
      setError('Please select a stock category.')
      return
    }
    setError('')
    await onSave({
      ...initialItem,
      ...form,
      name: form.name.trim(),
      currentQuantity: Number(form.currentQuantity) || 0,
      purchasePrice: Number(form.purchasePrice) || 0,
      minimumStock: Number(form.minimumStock) || 0,
    })
  }

  const handleCategoryChange = async (change) => {
    const nextCategories = await onCategoriesChange?.() || categories
    if (change.type === 'created') {
      updateForm('category', change.category.name)
      return
    }
    if (change.type === 'updated' && form.category === change.previousName) {
      const canKeepSelected = change.category.isActive || initialItem?.category === change.previousName
      updateForm('category', canKeepSelected ? change.category.name : nextCategories.find((category) => category.isActive)?.name || '')
      return
    }
    if (change.type === 'deleted' && form.category === change.category.name) {
      updateForm('category', nextCategories.find((category) => category.isActive)?.name || '')
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6"
      >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="font-bold text-slate-900">{initialItem ? 'Edit Stock Item' : 'Add Stock Item'}</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {initialItem ? 'Update item details and low-stock alert.' : 'Add an item and its current quantity.'}
          </p>
        </div>
        {(canCreateCategory || canEditCategory || canDeleteCategory) && <button type="button" onClick={() => setShowCategories(true)} className="flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-primary/30 bg-primary-light px-3.5 text-sm font-semibold text-primary-dark transition hover:border-primary/50 hover:bg-primary/15"><FiFolder /> Manage Categories</button>}
      </div>

      {(error || apiError) && (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span className="flex-1">{error || apiError}</span>
          <button
            type="button"
            onClick={() => { setError(''); onClearError?.() }}
            aria-label="Close error message"
            className="grid size-6 shrink-0 place-items-center rounded-md hover:bg-rose-100"
          >
            <FiX />
          </button>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Item Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => updateForm('name', event.target.value)}
            placeholder="Enter item name"
            className={inputClass}
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Category</span>
          <select
            value={form.category}
            onChange={(event) => updateForm('category', event.target.value)}
            className={inputClass}
          >
            {!availableCategories.length && <option value="">No active categories</option>}
            {availableCategories.map((category) => (
              <option key={category.id} value={category.name}>{category.name}{category.isActive ? '' : ' (Inactive)'}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Unit</span>
          <select
            value={form.unit}
            onChange={(event) => updateForm('unit', event.target.value)}
            className={inputClass}
          >
            {unitOptions.map((unit) => (
              <option key={unit} value={unit}>{unitName(unit)}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            {initialItem ? `Current Stock (${unitName(form.unit)})` : `Stock Available Now (${unitName(form.unit)})`}
          </span>
          <input
            type="number"
            min="0"
            step="0.001"
            value={form.currentQuantity}
            onChange={(event) => updateForm('currentQuantity', event.target.value)}
            readOnly={Boolean(initialItem)}
            className={`${inputClass} ${initialItem ? 'bg-slate-50 text-slate-500' : ''}`}
          />
          {initialItem ? <p className="mt-1 text-xs text-slate-400">Use Stock In or Stock Out to change quantity.</p> : <p className="mt-1 text-xs text-slate-400">Enter 0 if no stock is available yet.</p>}
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Buying Price per {unitName(form.unit)}</span>
          <input
            type="number"
            min="0"
            step="0.001"
            value={form.purchasePrice}
            onChange={(event) => updateForm('purchasePrice', event.target.value)}
            className={inputClass}
          />
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Low Stock Alert At ({unitName(form.unit)})</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.minimumStock}
            onChange={(event) => updateForm('minimumStock', event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="sm:col-span-2 xl:col-span-3">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Supplier <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <select
            value={form.supplierId}
            onChange={(event) => updateForm('supplierId', event.target.value)}
            className={inputClass}
          >
            <option value="">No supplier selected</option>
            {availableSuppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <Link
          to="/stock"
          className="flex h-10 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiSave /> {submitting ? 'Saving...' : initialItem ? 'Update Item' : 'Add Item'}
        </button>
      </div>
      </form>
      <StockCategoryManager open={showCategories} categories={categories} canCreate={canCreateCategory} canEdit={canEditCategory} canDelete={canDeleteCategory} onChanged={handleCategoryChange} onClose={() => setShowCategories(false)} />
    </>
  )
}

export default StockItemForm
