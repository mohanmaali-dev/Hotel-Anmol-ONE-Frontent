import { useEffect, useRef, useState } from 'react'
import { FiEdit2, FiFolder, FiPlus, FiPower, FiTrash2, FiX } from 'react-icons/fi'

import { createStockCategory, deleteStockCategory, updateStockCategory } from '../../api/stockApi.js'
import ConfirmDeleteModal from '../ConfirmDeleteModal.jsx'
import Toast from '../Toast.jsx'

function StockCategoryManager({ open, categories, canCreate, canEdit, canDelete, onChanged, onClose }) {
  const inputRef = useRef(null)
  const [name, setName] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => inputRef.current?.focus(), 0)
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !working && !pendingDelete) onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose, open, pendingDelete, working])

  const resetForm = () => {
    setName('')
    setEditingCategory(null)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) {
      setNotice({ type: 'error', text: 'Please enter a category name.' })
      return
    }
    if (working) return
    setWorking(true)
    try {
      const previousName = editingCategory?.name
      const result = editingCategory
        ? await updateStockCategory(editingCategory.id, { name: cleanName })
        : await createStockCategory({ name: cleanName })
      await onChanged?.({ type: editingCategory ? 'updated' : 'created', category: result.data, previousName })
      setNotice({ type: 'success', text: result.message })
      resetForm()
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    } finally {
      setWorking(false)
    }
  }

  const handleToggle = async (category) => {
    if (working) return
    setWorking(true)
    try {
      const result = await updateStockCategory(category.id, { isActive: !category.isActive })
      await onChanged?.({ type: 'updated', category: result.data, previousName: category.name })
      setNotice({ type: 'success', text: `${result.data.name} is now ${result.data.isActive ? 'active' : 'inactive'}.` })
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    } finally {
      setWorking(false)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete || working) return
    setWorking(true)
    try {
      const result = await deleteStockCategory(pendingDelete.id)
      await onChanged?.({ type: 'deleted', category: pendingDelete })
      setPendingDelete(null)
      setNotice({ type: 'success', text: result.message })
      if (editingCategory?.id === pendingDelete.id) resetForm()
    } catch (error) {
      setPendingDelete(null)
      setNotice({ type: 'error', text: error.message })
    } finally {
      setWorking(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !working) onClose() }}>
      <Toast message={notice?.text} type={notice?.type} onClose={() => setNotice(null)} />
      <section role="dialog" aria-modal="true" aria-labelledby="stock-category-title" className="flex max-h-[min(42rem,calc(100vh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiFolder /></span><div><h2 id="stock-category-title" className="font-bold text-slate-900">Stock Categories</h2><p className="mt-0.5 text-xs text-slate-500">Add and organize categories used for stock items.</p></div></div>
          <button type="button" disabled={working} onClick={onClose} aria-label="Close stock categories" className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><FiX /></button>
        </header>

        {(canCreate || editingCategory) && (
          <form onSubmit={handleSave} className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row">
            <label className="min-w-0 flex-1"><span className="sr-only">Category name</span><input ref={inputRef} type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter category name" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></label>
            {editingCategory && <button type="button" disabled={working} onClick={resetForm} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel Edit</button>}
            <button type="submit" disabled={working} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">{editingCategory ? <FiEdit2 /> : <FiPlus />} {working ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}</button>
          </form>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Category Name</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((category) => (
                  <tr key={category.id} className="text-slate-700">
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{category.name}</td>
                    <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{category.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3.5"><div className="flex justify-end gap-1.5">{canEdit && <><button type="button" disabled={working} onClick={() => { setEditingCategory(category); setName(category.name); window.setTimeout(() => inputRef.current?.focus(), 0) }} title="Rename category" aria-label={`Rename ${category.name}`} className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary-dark"><FiEdit2 /></button><button type="button" disabled={working} onClick={() => handleToggle(category)} title={category.isActive ? 'Make inactive' : 'Make active'} aria-label={`${category.isActive ? 'Deactivate' : 'Activate'} ${category.name}`} className={`grid size-8 place-items-center rounded-lg border ${category.isActive ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}><FiPower /></button></>}{canDelete && <button type="button" disabled={working} onClick={() => setPendingDelete(category)} title="Delete category" aria-label={`Delete ${category.name}`} className="grid size-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"><FiTrash2 /></button>}</div></td>
                  </tr>
                ))}
                {!categories.length && <tr><td colSpan="3" className="px-4 py-10 text-center text-sm text-slate-500">No stock categories yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ConfirmDeleteModal open={Boolean(pendingDelete)} title={`Delete ${pendingDelete?.name || 'category'}?`} message="This stock category will be permanently removed." dependencyType="stock-category" recordId={pendingDelete?.id} confirmLabel="Delete Category" loading={working} onConfirm={handleDelete} onClose={() => setPendingDelete(null)} />
    </div>
  )
}

export default StockCategoryManager
