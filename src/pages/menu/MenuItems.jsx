import { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft, FiPlus, FiSearch, FiTag, FiX } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'

import { deleteMenuItem, getAllMenuCategories, getMenuItems, updateMenuItem } from '../../api/menuApi.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'
import MobileFilterPanel from '../../components/MobileFilterPanel.jsx'
import Pagination from '../../components/Pagination.jsx'
import Toast from '../../components/Toast.jsx'
import MenuItemTable from '../../components/menu/MenuItemTable.jsx'
import MenuSectionNav from '../../components/menu/MenuSectionNav.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10'
const emptyFilters = { search: '', category: '', availability: '' }
const pageSize = 20

function MenuItems() {
  const location = useLocation()
  const { can } = useAuth()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: pageSize, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [notice, setNotice] = useState(location.state?.message ? { type: 'success', text: location.state.message } : null)

  useEffect(() => { getAllMenuCategories().then(setCategories).catch(() => {}) }, [])

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getMenuItems({ page, limit: pageSize, ...(filters.search.trim() ? { search: filters.search.trim() } : {}), ...(filters.category ? { category: filters.category } : {}), ...(filters.availability ? { availability: filters.availability } : {}) })
      setItems(result.data)
      setPagination(result.pagination || { page, limit: pageSize, total: result.data.length, pages: 1 })
    } catch (requestError) { setItems([]); setNotice({ type: 'error', text: requestError.message }) }
    finally { setLoading(false) }
  }, [filters, page])

  useEffect(() => { const timer = window.setTimeout(loadItems, filters.search ? 300 : 0); return () => window.clearTimeout(timer) }, [filters.search, loadItems])

  const updateFilter = (field, value) => { setPage(1); setFilters((current) => ({ ...current, [field]: value })) }
  const handleToggle = async (item) => {
    try { const result = await updateMenuItem(item.id, { isAvailable: !item.isAvailable }); await loadItems(); setNotice({ type: 'success', text: result.message }) }
    catch (requestError) { setNotice({ type: 'error', text: requestError.message }) }
  }
  const handleDelete = async () => {
    if (!pendingDelete || deleting) return
    setDeleting(true)
    try { const result = await deleteMenuItem(pendingDelete.id); setPendingDelete(null); await loadItems(); setNotice({ type: 'success', text: result.message }) }
    catch (requestError) { setPendingDelete(null); setNotice({ type: 'error', text: requestError.message }) }
    finally { setDeleting(false) }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <Toast message={notice?.text} type={notice?.type} onClose={() => setNotice(null)} />
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Link to="/menu" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Menu</Link><div className="mt-3 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Menu Items</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiTag /></span></div><p className="mt-1 text-sm text-slate-500">Manage prices, availability, and stock recipes.</p></div>{can('menu', 'create') && <Link to="/menu/items/new" className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus /> Add Menu Item</Link>}</div>
      <MenuSectionNav />
      <MobileFilterPanel filters={filters} className="mb-5 p-4"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_auto]">
        <label className="relative"><span className="sr-only">Search item</span><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search item" className={`${inputClass} pl-9`} /></label>
        <select aria-label="Category" value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} className={inputClass}><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <select aria-label="Availability" value={filters.availability} onChange={(event) => updateFilter('availability', event.target.value)} className={inputClass}><option value="">All availability</option><option value="Available">Available</option><option value="Unavailable">Unavailable</option></select>
        <button type="button" onClick={() => { setPage(1); setFilters(emptyFilters) }} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><FiX /> Clear</button>
      </div></MobileFilterPanel>
      <div className="space-y-5"><MenuItemTable items={items} categories={categories} loading={loading} total={pagination.total} canEdit={can('menu', 'edit')} canDelete={can('menu', 'delete')} onToggleAvailability={(id) => handleToggle(items.find((item) => item.id === id))} onDelete={setPendingDelete} />{!loading && <Pagination pagination={pagination} onPageChange={setPage} label="menu items" />}</div>
      <ConfirmDeleteModal open={Boolean(pendingDelete)} title={`Delete ${pendingDelete?.name || 'menu item'}?`} message="This menu item and its recipe will be permanently removed." dependencyType="menu-item" recordId={pendingDelete?.id} confirmLabel="Delete Menu Item" loading={deleting} onConfirm={handleDelete} onClose={() => setPendingDelete(null)} />
    </div></main>
  )
}

export default MenuItems
