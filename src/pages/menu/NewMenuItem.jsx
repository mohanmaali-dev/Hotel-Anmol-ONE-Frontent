import { useEffect, useState } from 'react'
import { FiArrowLeft, FiTag } from 'react-icons/fi'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { createMenuItem, getAllMenuCategories, getMenuItem, updateMenuItem } from '../../api/menuApi.js'
import { getAllStockItems } from '../../api/stockApi.js'
import MenuItemForm from '../../components/menu/MenuItemForm.jsx'

function NewMenuItem() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const [initialItem, setInitialItem] = useState(null)
  const [categories, setCategories] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const requests = [getAllMenuCategories(), getAllStockItems({ active: true })]
    if (editId) requests.push(getMenuItem(editId))
    Promise.all(requests)
      .then(([categoryResult, stockResult, itemResult]) => { if (!active) return; setCategories(categoryResult); setStockItems(stockResult); if (itemResult) setInitialItem(itemResult.data) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [editId])

  const handleSave = async (item) => {
    if (submitting) return
    setSubmitting(true); setError('')
    try {
      const result = editId ? await updateMenuItem(editId, item) : await createMenuItem(item)
      navigate(`/menu/items/${result.data.id}`, { state: { message: result.message } })
    } catch (requestError) { setError(requestError.message) }
    finally { setSubmitting(false) }
  }

  if (loading) return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="text-center"><span className="mx-auto block size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading menu item form...</p></div></main>
  if (editId && !initialItem) return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12"><div className="text-center"><FiTag className="mx-auto text-3xl text-slate-400" /><h2 className="mt-4 text-xl font-bold text-slate-900">Menu item not found</h2><p className="mt-2 text-sm text-rose-600">{error}</p><Link to="/menu/items" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiArrowLeft /> Back to Menu Items</Link></div></main>

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <div className="mb-6"><Link to={initialItem ? `/menu/items/${initialItem.id}` : '/menu/items'} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Menu Items</Link><h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{initialItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2><p className="mt-1 text-sm text-slate-500">Set the selling price, availability, and optional stock recipe.</p></div>
      <MenuItemForm initialItem={initialItem} categories={categories} stockItems={stockItems} onSave={handleSave} submitting={submitting} apiError={error} onClearError={() => setError('')} />
    </div></main>
  )
}

export default NewMenuItem
