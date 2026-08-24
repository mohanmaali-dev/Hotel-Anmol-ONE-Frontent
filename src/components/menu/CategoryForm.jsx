import { useState } from 'react'
import { FiAlertCircle, FiSave, FiX } from 'react-icons/fi'

function CategoryForm({ initialCategory, onSave, onCancel, submitting = false, apiError = '', onClearError }) {
  const [form, setForm] = useState({
    name: initialCategory?.name || '',
    description: initialCategory?.description || '',
    isActive: initialCategory?.isActive ?? true,
  })
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Please enter a category name.')
      return
    }
    setError('')
    await onSave({ ...initialCategory, ...form, name: form.name.trim() })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-primary/20 bg-white p-5 shadow-sm shadow-slate-200/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900">
            {initialCategory ? 'Edit Category' : 'Add Category'}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">Keep category names short and easy to find.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close category form"
          className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
        >
          <FiX />
        </button>
      </div>

      {(error || apiError) && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
          <FiAlertCircle /><span className="flex-1">{error || apiError}</span><button type="button" onClick={() => { setError(''); onClearError?.() }} aria-label="Close category error" className="grid size-6 place-items-center rounded-md hover:bg-rose-100"><FiX /></button>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr_auto] lg:items-end">
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Category Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="e.g. Breakfast"
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Description</span>
          <input
            type="text"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Brief category description"
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setForm((current) => ({ ...current, isActive: !current.isActive }))}
            className={`h-10 rounded-lg border px-3 text-sm font-semibold ${
              form.isActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            {form.isActive ? 'Enabled' : 'Disabled'}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSave /> {submitting ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default CategoryForm
