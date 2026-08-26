import { useEffect, useState } from 'react'
import { FiArrowLeft, FiPackage } from 'react-icons/fi'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { createStockItem, getStockCategories, getStockItem, updateStockItem } from '../../api/stockApi.js'
import { getAllSuppliers } from '../../api/supplierApi.js'
import StockItemForm from '../../components/stock/StockItemForm.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function StockItems() {
  const navigate = useNavigate()
  const { can } = useAuth()
  const canViewSuppliers = can('suppliers', 'view')
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const [initialItem, setInitialItem] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const requests = [
      canViewSuppliers ? getAllSuppliers({ status: 'Active' }) : Promise.resolve([]),
      getStockCategories(),
    ]
    if (editId) requests.push(getStockItem(editId))

    Promise.allSettled(requests)
      .then(([supplierResult, categoryResult, itemResult]) => {
        if (!active) return
        if (supplierResult.status === 'fulfilled') setSuppliers(supplierResult.value)
        if (canViewSuppliers && supplierResult.status === 'rejected') setError(`Suppliers could not be loaded. ${supplierResult.reason.message}`)
        if (categoryResult.status === 'fulfilled') setCategories(categoryResult.value.data)
        if (categoryResult.status === 'rejected') setError(categoryResult.reason.message)
        if (itemResult?.status === 'fulfilled') setInitialItem(itemResult.value.data)
        if (itemResult?.status === 'rejected') setError(itemResult.reason.message)
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [canViewSuppliers, editId])

  const refreshCategories = async () => {
    const result = await getStockCategories()
    setCategories(result.data)
    return result.data
  }

  const handleSave = async (item) => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      const result = editId
        ? await updateStockItem(editId, item)
        : await createStockItem(item)
      navigate('/stock', {
        state: { message: `${result.data.name} ${editId ? 'updated' : 'added'} successfully.` },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="page-content">
        <div className="mb-6">
          <Link to="/stock" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Stock</Link>
          <div className="mt-3 flex items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">{editId ? 'Edit Stock Item' : 'Add Stock Item'}</h2><span className="grid size-8 place-items-center rounded-lg bg-primary-light text-primary-dark"><FiPackage /></span></div>
          <p className="mt-1 text-sm text-slate-500">Manage item details and minimum stock level.</p>
        </div>

        {loading ? (
          <div className="grid place-items-center rounded-xl border border-slate-200 bg-white py-20"><span className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading item...</p></div>
        ) : editId && !initialItem ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><FiPackage className="mx-auto text-3xl text-slate-400" /><h3 className="mt-3 font-bold text-slate-800">Stock item not found</h3><p className="mt-1 text-sm text-slate-500">{error || 'This item may have been removed.'}</p><Link to="/stock/items" className="mt-5 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">Add a New Item</Link></div>
        ) : (
          <StockItemForm initialItem={initialItem} suppliers={suppliers} categories={categories} showSupplierField={canViewSuppliers} canCreateCategory={can('stock', 'create')} canEditCategory={can('stock', 'edit')} canDeleteCategory={can('stock', 'delete')} onCategoriesChange={refreshCategories} onSave={handleSave} submitting={submitting} apiError={error} onClearError={() => setError('')} />
        )}
      </div>
    </main>
  )
}

export default StockItems
