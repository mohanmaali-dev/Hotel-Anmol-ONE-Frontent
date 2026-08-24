import { useCallback, useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

import { deleteMenuCategory, deleteMenuItem, getMenuCategories, getMenuItems, updateMenuCategory, updateMenuItem } from '../../api/menuApi.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'
import Toast from '../../components/Toast.jsx'
import CategoryTable from '../../components/menu/CategoryTable.jsx'
import MenuItemTable from '../../components/menu/MenuItemTable.jsx'
import MenuSectionNav from '../../components/menu/MenuSectionNav.jsx'
import MenuSummary from '../../components/menu/MenuSummary.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function Menu() {
  const navigate = useNavigate()
  const { can } = useAuth()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [counts, setCounts] = useState({ categories: 0, items: 0, available: 0, unavailable: 0 })
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [notice, setNotice] = useState(null)

  const loadMenu = useCallback(async () => {
    setLoading(true)
    try {
      const [categoryResult, itemResult, availableResult, unavailableResult] = await Promise.all([
        getMenuCategories(),
        getMenuItems({ page: 1, limit: 6 }),
        getMenuItems({ availability: 'Available', page: 1, limit: 1 }),
        getMenuItems({ availability: 'Unavailable', page: 1, limit: 1 }),
      ])
      setCategories(categoryResult.data)
      setItems(itemResult.data)
      setCounts({ categories: categoryResult.data.length, items: itemResult.pagination?.total ?? itemResult.data.length, available: availableResult.pagination?.total ?? availableResult.data.length, unavailable: unavailableResult.pagination?.total ?? unavailableResult.data.length })
    } catch (requestError) {
      setNotice({ type: 'error', text: requestError.message })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadMenu() }, [loadMenu])

  const runAction = async (action) => {
    try {
      const result = await action()
      await loadMenu()
      setNotice({ type: 'success', text: result.message })
    } catch (requestError) { setNotice({ type: 'error', text: requestError.message }) }
  }

  const handleDeleteCategory = (category) => {
    setPendingDelete({ type: 'category', record: category })
  }
  const handleDeleteItem = (item) => {
    setPendingDelete({ type: 'item', record: item })
  }
  const confirmDelete = async () => {
    if (!pendingDelete || deleteLoading) return
    setDeleteLoading(true)
    try {
      const result = pendingDelete.type === 'category'
        ? await deleteMenuCategory(pendingDelete.record.id)
        : await deleteMenuItem(pendingDelete.record.id)
      setPendingDelete(null)
      await loadMenu()
      setNotice({ type: 'success', text: result.message })
    } catch (requestError) {
      setPendingDelete(null)
      setNotice({ type: 'error', text: requestError.message })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <Toast message={notice?.text} type={notice?.type} onClose={() => setNotice(null)} />
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><p className="text-sm font-semibold text-primary-dark">MENU MANAGEMENT</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Restaurant Menu</h2><p className="mt-1 text-sm text-slate-500">Manage the dishes customers order and the categories used to organize them.</p></div>{can('menu', 'create') && <Link to="/menu/items/new" className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"><FiPlus /> Add Menu Item</Link>}</div>
      <MenuSectionNav />
      <MenuSummary categories={categories} items={items} counts={counts} loading={loading} />
      <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-2"><MenuItemTable items={items} categories={categories} loading={loading} total={counts.items} canEdit={can('menu', 'edit')} canDelete={can('menu', 'delete')} onToggleAvailability={(id) => { const item = items.find((entry) => entry.id === id); runAction(() => updateMenuItem(id, { isAvailable: !item.isAvailable })) }} onDelete={handleDeleteItem} /><CategoryTable categories={categories.slice(0, 6)} loading={loading} canEdit={can('menu', 'edit')} canDelete={can('menu', 'delete')} onEdit={(category) => navigate(`/menu/categories?edit=${category.id}`)} onToggle={(id) => { const category = categories.find((entry) => entry.id === id); runAction(() => updateMenuCategory(id, { isActive: !category.isActive })) }} onDelete={handleDeleteCategory} /></div>
      <ConfirmDeleteModal open={Boolean(pendingDelete)} title={`Delete ${pendingDelete?.record?.name || 'record'}?`} message={pendingDelete?.type === 'category' ? 'This category will be permanently removed. Categories containing menu items cannot be deleted.' : 'This menu item and its recipe will be permanently removed. Deletion may be blocked if existing orders use this item.'} confirmLabel={pendingDelete?.type === 'category' ? 'Delete Category' : 'Delete Menu Item'} loading={deleteLoading} onConfirm={confirmDelete} onClose={() => setPendingDelete(null)} />
    </div></main>
  )
}

export default Menu
