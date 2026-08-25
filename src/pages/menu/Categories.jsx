import { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft, FiGrid, FiPlus } from 'react-icons/fi'
import { Link, useSearchParams } from 'react-router-dom'

import { createMenuCategory, deleteMenuCategory, getMenuCategories, updateMenuCategory } from '../../api/menuApi.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'
import Pagination from '../../components/Pagination.jsx'
import Toast from '../../components/Toast.jsx'
import CategoryForm from '../../components/menu/CategoryForm.jsx'
import CategoryTable from '../../components/menu/CategoryTable.jsx'
import MenuSectionNav from '../../components/menu/MenuSectionNav.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const pageSize = 20

function Categories() {
  const [searchParams] = useSearchParams()
  const { can } = useAuth()
  const editId = searchParams.get('edit')
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [editingCategory, setEditingCategory] = useState(null)
  const [showForm, setShowForm] = useState(Boolean(editId))
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [notice, setNotice] = useState(null)

  const loadCategories = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getMenuCategories({ page, limit: pageSize })
      if (page > 1 && result.data.length === 0 && result.pagination?.total > 0) {
        setPage(Math.max(result.pagination.pages, 1))
        return
      }
      setCategories(result.data)
      setPagination(result.pagination || { page, limit: pageSize, total: result.data.length, pages: 1 })
      if (editId) setEditingCategory(result.data.find((category) => category.id === editId) || null)
    } catch (requestError) { setNotice({ type: 'error', text: requestError.message }) }
    finally { setLoading(false) }
  }, [editId, page])
  useEffect(() => { loadCategories() }, [loadCategories])

  const handleSave = async (category) => {
    if (submitting) return
    setSubmitting(true)
    try {
      const result = category.id ? await updateMenuCategory(category.id, category) : await createMenuCategory(category)
      await loadCategories()
      setEditingCategory(null); setShowForm(false)
      setNotice({ type: 'success', text: result.message })
    } catch (requestError) { setNotice({ type: 'error', text: requestError.message }) }
    finally { setSubmitting(false) }
  }

  const handleToggle = async (id) => {
    const category = categories.find((entry) => entry.id === id)
    try { const result = await updateMenuCategory(id, { isActive: !category.isActive }); await loadCategories(); setNotice({ type: 'success', text: result.message }) }
    catch (requestError) { setNotice({ type: 'error', text: requestError.message }) }
  }
  const handleDelete = async () => {
    if (!pendingDelete || deleting) return
    setDeleting(true)
    try { const result = await deleteMenuCategory(pendingDelete.id); setPendingDelete(null); await loadCategories(); setNotice({ type: 'success', text: result.message }) }
    catch (requestError) { setPendingDelete(null); setNotice({ type: 'error', text: requestError.message }) }
    finally { setDeleting(false) }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <Toast message={notice?.text} type={notice?.type} onClose={() => setNotice(null)} />
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Link to="/menu" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Menu</Link><div className="mt-3 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Menu Categories</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiGrid /></span></div><p className="mt-1 text-sm text-slate-500">Organize menu items into simple categories.</p></div>{can('menu', 'create') && <button type="button" onClick={() => { setEditingCategory(null); setShowForm(true) }} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus /> Add Category</button>}</div>
      <MenuSectionNav />
      {showForm && <div className="mb-6"><CategoryForm key={editingCategory?.id || 'new-category'} initialCategory={editingCategory} submitting={submitting} apiError={notice?.type === 'error' ? notice.text : ''} onClearError={() => setNotice(null)} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingCategory(null) }} /></div>}
      <div className="space-y-5"><CategoryTable categories={categories} total={pagination.total} loading={loading} canEdit={can('menu', 'edit')} canDelete={can('menu', 'delete')} onEdit={(category) => { setEditingCategory(category); setShowForm(true) }} onToggle={handleToggle} onDelete={setPendingDelete} />{!loading && <Pagination pagination={pagination} onPageChange={setPage} label="categories" />}</div>
      <ConfirmDeleteModal open={Boolean(pendingDelete)} title={`Delete ${pendingDelete?.name || 'category'}?`} message="This menu category will be permanently removed." dependencyType="menu-category" recordId={pendingDelete?.id} confirmLabel="Delete Category" loading={deleting} onConfirm={handleDelete} onClose={() => setPendingDelete(null)} />
    </div></main>
  )
}

export default Categories
