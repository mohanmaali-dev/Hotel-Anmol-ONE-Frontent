import { useState } from 'react'
import { FiAlertCircle, FiPlus, FiSave, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import IngredientRow from './IngredientRow.jsx'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

const createIngredient = (ingredient = {}) => ({
  rowId: `${Date.now()}-${Math.random()}`,
  stockItemId: ingredient.stockItemId || '',
  stockItemName: ingredient.stockItemName || '',
  quantityUsed: ingredient.quantityUsed || 1,
  unit: ingredient.unit || '',
})

function MenuItemForm({ initialItem, categories, stockItems, onSave, submitting = false, apiError = '', onClearError }) {
  const [form, setForm] = useState({
    name: initialItem?.name || '',
    categoryId: initialItem?.categoryId || categories.find((category) => category.isActive)?.id || '',
    sellingPrice: initialItem?.sellingPrice || 0,
    servingSize: initialItem?.servingSize || '',
    description: initialItem?.description || '',
    isAvailable: initialItem?.isAvailable ?? true,
    trackStock: initialItem?.trackStock ?? false,
  })
  const [ingredients, setIngredients] = useState(
    initialItem?.ingredients?.length
      ? initialItem.ingredients.map(createIngredient)
      : [createIngredient()],
  )
  const [error, setError] = useState('')

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updateIngredient = (rowId, field, value) => {
    setIngredients((currentIngredients) =>
      currentIngredients.map((ingredient) => {
        if (ingredient.rowId !== rowId) return ingredient
        if (field === 'stockItemId') {
          const stockItem = stockItems.find((item) => item.id === value)
          return {
            ...ingredient,
            stockItemId: value,
            stockItemName: stockItem?.name || '',
            unit: stockItem?.unit || '',
          }
        }
        if (field === 'quantityUsed') {
          return { ...ingredient, quantityUsed: Math.max(0, Number(value) || 0) }
        }
        if (field === 'unit') return { ...ingredient, unit: value }
        return ingredient
      }),
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const selectedIngredients = ingredients.filter(
      (ingredient) => ingredient.stockItemId && ingredient.quantityUsed > 0,
    )

    if (!form.name.trim() || !form.categoryId || Number(form.sellingPrice) < 0) {
      setError('Please enter the item name, category, and a valid selling price.')
      return
    }

    if (form.trackStock && !selectedIngredients.length) {
      setError('Please add at least one stock ingredient or turn Stock Tracking off.')
      return
    }

    if (
      form.trackStock &&
      new Set(selectedIngredients.map((ingredient) => ingredient.stockItemId)).size !==
        selectedIngredients.length
    ) {
      setError('Each stock ingredient should be selected only once.')
      return
    }

    setError('')
    await onSave({
      ...initialItem,
      ...form,
      name: form.name.trim(),
      servingSize: form.servingSize.trim(),
      sellingPrice: Number(form.sellingPrice),
      ingredients: selectedIngredients.map(
        ({ stockItemId, stockItemName, quantityUsed, unit }) => ({
          stockItemId,
          stockItemName,
          quantityUsed,
          unit,
        }),
      ),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(error || apiError) && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span className="flex-1">{error || apiError}</span>
          <button type="button" onClick={() => { setError(''); onClearError?.() }} aria-label="Close error message" className="grid size-6 place-items-center rounded-md hover:bg-rose-100">
            <FiX />
          </button>
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
        <h2 className="font-bold text-slate-900">Menu Item Information</h2>
        <p className="mt-0.5 text-xs text-slate-500">Basic item, pricing, and availability details</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Item Name</span>
            <input type="text" value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Enter menu item name" className={inputClass} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Category</span>
            <select value={form.categoryId} onChange={(event) => updateForm('categoryId', event.target.value)} className={inputClass}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}{category.isActive ? '' : ' (Disabled)'}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Selling Price</span>
            <input type="number" min="0" value={form.sellingPrice} onChange={(event) => updateForm('sellingPrice', event.target.value)} className={inputClass} />
            <p className="mt-1 text-xs text-slate-400">Independent from ingredient purchase prices.</p>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Serving Size <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <input type="text" maxLength="80" value={form.servingSize} onChange={(event) => updateForm('servingSize', event.target.value)} placeholder="Example: 1 Plate or 250 ml" className={inputClass} />
            <p className="mt-1 text-xs text-slate-400">Shown on orders and bills.</p>
          </label>
          <label className="sm:col-span-2 xl:col-span-4">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <textarea rows="3" value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Brief item description" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </label>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">Availability</legend>
            <div className="grid grid-cols-2 gap-2">
              {[true, false].map((value) => (
                <button key={String(value)} type="button" onClick={() => updateForm('isAvailable', value)} className={`h-10 rounded-lg border text-sm font-semibold ${form.isAvailable === value ? 'border-primary bg-primary-light text-primary-dark' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {value ? 'Available' : 'Unavailable'}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">Track Stock</legend>
            <div className="grid grid-cols-2 gap-2">
              {[true, false].map((value) => (
                <button key={String(value)} type="button" onClick={() => updateForm('trackStock', value)} className={`h-10 rounded-lg border text-sm font-semibold ${form.trackStock === value ? 'border-primary bg-primary-light text-primary-dark' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {value ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      {form.trackStock && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900">Ingredients / Stock Items</h2>
              <p className="mt-0.5 text-xs text-slate-500">Choose how much stock one plate or serving uses.</p>
            </div>
            <button type="button" onClick={() => setIngredients((current) => [...current, createIngredient()])} className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-primary/30 px-3 text-sm font-semibold text-primary-dark hover:bg-primary-light">
              <FiPlus /> Add Ingredient
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {ingredients.map((ingredient) => (
              <IngredientRow
                key={ingredient.rowId}
                ingredient={ingredient}
                stockItems={stockItems}
                onChange={(field, value) => updateIngredient(ingredient.rowId, field, value)}
                onRemove={() => setIngredients((current) => current.filter((row) => row.rowId !== ingredient.rowId))}
                canRemove={ingredients.length > 1}
              />
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
            Stock is removed only when an order is marked Completed.
          </p>
        </section>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link to={initialItem ? `/menu/items/${initialItem.id}` : '/menu/items'} className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</Link>
        <button type="submit" disabled={submitting || !categories.length} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60">
          <FiSave /> {submitting ? 'Saving...' : initialItem ? 'Update Menu Item' : 'Save Menu Item'}
        </button>
      </div>
    </form>
  )
}

export default MenuItemForm
