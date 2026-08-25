import { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft, FiEdit2, FiPackage, FiPower, FiTag, FiTrash2 } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { deleteMenuItem, getMenuItem, isMenuItemAvailable, updateMenuItem } from '../../api/menuApi.js'
import { getStockItems } from '../../api/stockApi.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'
import DangerZone from '../../components/DangerZone.jsx'
import Toast from '../../components/Toast.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency } from '../../utils/orderFormatters.js'

function DetailItem({ label, value }) {
  return <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1.5 text-sm font-semibold text-slate-800">{value || '—'}</p></div>
}

function MenuItemDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { can } = useAuth()
  const [item, setItem] = useState(null)
  const [stockItems, setStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notice, setNotice] = useState(location.state?.message ? { type: 'success', text: location.state.message } : null)

  const loadDetails = useCallback(async () => {
    setLoading(true)
    try {
      const [itemResult, stockResult] = await Promise.allSettled([getMenuItem(id), getStockItems({ page: 1, limit: 100 })])
      if (itemResult.status === 'rejected') throw itemResult.reason
      setItem(itemResult.value.data)
      if (stockResult.status === 'fulfilled') setStockItems(stockResult.value.data)
    } catch (requestError) { setItem(null); setNotice({ type: 'error', text: requestError.message }) }
    finally { setLoading(false) }
  }, [id])
  useEffect(() => { loadDetails() }, [loadDetails])

  const handleToggle = async () => {
    if (working) return
    setWorking(true)
    try { const result = await updateMenuItem(item.id, { isAvailable: !item.isAvailable }); setItem(result.data); setNotice({ type: 'success', text: result.message }) }
    catch (requestError) { setNotice({ type: 'error', text: requestError.message }) }
    finally { setWorking(false) }
  }
  const handleDelete = async () => {
    setWorking(true)
    try { const result = await deleteMenuItem(item.id); navigate('/menu/items', { state: { message: result.message } }) }
    catch (requestError) { setNotice({ type: 'error', text: requestError.message }); setWorking(false); setConfirmDelete(false) }
  }

  if (loading) return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="text-center"><span className="mx-auto block size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading menu item...</p></div></main>
  if (!item) return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12"><div className="text-center"><FiTag className="mx-auto text-3xl text-slate-400" /><h2 className="mt-4 text-xl font-bold text-slate-900">Menu item not found</h2><p className="mt-2 text-sm text-rose-600">{notice?.text}</p><Link to="/menu/items" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiArrowLeft /> Back to Menu Items</Link></div></main>

  const category = item.category
  const available = isMenuItemAvailable(item)
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <Toast message={notice?.text} type={notice?.type} onClose={() => setNotice(null)} />
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Link to="/menu/items" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Menu Items</Link><div className="mt-3 flex flex-wrap items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">{item.name}</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold ${available ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{available ? 'Available' : 'Unavailable'}</span></div><p className="mt-1 text-sm text-slate-500">Complete menu item and recipe information.</p></div><div className="flex flex-wrap gap-2">{can('menu', 'edit') && <><button type="button" disabled={working} onClick={handleToggle} className={`flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold disabled:opacity-50 ${item.isAvailable ? 'border-rose-200 text-rose-700 hover:bg-rose-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}><FiPower /> {item.isAvailable ? 'Make Unavailable' : 'Make Available'}</button><Link to={`/menu/items/new?edit=${item.id}`} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-white hover:bg-primary-dark"><FiEdit2 /> Edit Item</Link></>}</div></div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiTag /></span><h3 className="font-bold text-slate-900">Item Information</h3></div><div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-6"><DetailItem label="Item Name" value={item.name} /><DetailItem label="Category" value={category?.name} /><DetailItem label="Serving Size" value={item.servingSize} /><DetailItem label="Selling Price" value={formatCurrency(item.sellingPrice)} /><DetailItem label="Availability" value={available ? 'Available' : 'Unavailable'} /><DetailItem label="Track Stock" value={item.trackStock ? 'Yes' : 'No'} /><div className="col-span-2 sm:col-span-3 lg:col-span-6"><DetailItem label="Description" value={item.description} /></div></div>{category && !category.isActive && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-700">This item is unavailable because its category is disabled.</p>}</section>
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40"><div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4"><span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-700"><FiPackage /></span><div><h3 className="font-bold text-slate-900">Ingredients / Recipe</h3><p className="mt-0.5 text-xs text-slate-500">Quantity used for one order item</p></div></div>
        {item.trackStock && item.ingredients.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead><tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">Stock Item</th><th className="px-4 py-3 text-right">Quantity Used</th><th className="px-4 py-3">Unit</th><th className="px-5 py-3 text-right">Current Stock</th></tr></thead><tbody className="divide-y divide-slate-100">{item.ingredients.map((ingredient) => { const stockItem = stockItems.find((stock) => stock.id === String(ingredient.stockItemId)); return <tr key={ingredient.stockItemId} className="text-sm text-slate-600"><td className="px-5 py-4 font-semibold text-slate-800">{stockItem?.name || ingredient.stockItemName}</td><td className="px-4 py-4 text-right font-bold text-slate-800">{ingredient.quantityUsed}</td><td className="px-4 py-4">{ingredient.unit}</td><td className="px-5 py-4 text-right">{stockItem ? `${stockItem.currentQuantity} ${stockItem.unit}` : '—'}</td></tr> })}</tbody></table></div> : <div className="px-5 py-10 text-center"><p className="font-semibold text-slate-700">Stock tracking is not configured</p><p className="mt-1 text-sm text-slate-500">No ingredient quantities will be deducted for this item.</p></div>}
      </section>
      {can('menu', 'delete') && <DangerZone title="Delete this menu item" description="Permanently remove this menu item and its recipe. Orders already using this item may prevent deletion."><button type="button" disabled={working} onClick={() => setConfirmDelete(true)} className="flex h-9 items-center gap-1.5 rounded-md border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"><FiTrash2 /> Delete Menu Item</button></DangerZone>}
      <ConfirmDeleteModal open={confirmDelete} title={`Delete ${item.name}?`} message="This menu item and its recipe will be permanently removed." dependencyType="menu-item" recordId={item.id} confirmLabel="Delete Menu Item" loading={working} onConfirm={handleDelete} onClose={() => setConfirmDelete(false)} />
    </div></main>
  )
}

export default MenuItemDetails
