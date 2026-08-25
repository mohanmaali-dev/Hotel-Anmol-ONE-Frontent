import { useEffect, useState } from 'react'
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { createPurchase, getPurchase, updatePurchase, updatePurchasePayment } from '../../api/purchaseApi.js'
import { getAllStockItems } from '../../api/stockApi.js'
import { getAllSuppliers } from '../../api/supplierApi.js'
import PurchaseForm from '../../components/purchases/PurchaseForm.jsx'

function NewPurchase() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const preselectedSupplierId = searchParams.get('supplier') || ''
  const [initialPurchase, setInitialPurchase] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const requests = [getAllSuppliers({ status: 'Active' }), getAllStockItems({ active: true })]
    if (editId) requests.push(getPurchase(editId))

    Promise.all(requests)
      .then(([supplierResult, stockResult, purchaseResult]) => {
        if (!active) return
        setSuppliers(supplierResult)
        setStockItems(stockResult)
        if (purchaseResult) setInitialPurchase(purchaseResult.data)
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [editId])

  const handleSave = async (purchase) => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      let result
      if (initialPurchase) {
        result = await updatePurchase(initialPurchase.id, purchase)
        if (
          Number(purchase.paidAmount) !== Number(initialPurchase.paidAmount) ||
          purchase.paymentType !== initialPurchase.paymentType
        ) {
          result = await updatePurchasePayment(initialPurchase.id, purchase)
        }
      } else {
        result = await createPurchase(purchase)
      }
      navigate(`/purchases/${result.data.id}`, {
        state: { message: result.message },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="text-center"><span className="mx-auto block size-10 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading purchase form...</p></div></main>

  if (editId && !initialPurchase) return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12"><div className="max-w-md text-center"><FiShoppingCart className="mx-auto text-3xl text-slate-400" /><h2 className="mt-4 text-xl font-bold text-slate-900">Purchase not found</h2><p className="mt-1 text-sm text-slate-500">{error}</p><Link to="/purchases" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiArrowLeft /> Back to Purchases</Link></div></main>

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="page-content">
      <div className="mb-6"><Link to={initialPurchase ? `/purchases/${initialPurchase.id}` : '/purchases'} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Purchases</Link><h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{initialPurchase ? 'Edit Purchase' : 'Create New Purchase'}</h2><p className="mt-1 text-sm text-slate-500">{initialPurchase ? 'Update supplier and item information. Payment can be changed from Purchase Details.' : 'Enter supplier, item, and payment details.'}</p></div>
      <PurchaseForm initialPurchase={initialPurchase} preselectedSupplierId={preselectedSupplierId} suppliers={suppliers} availableItems={stockItems} onSave={handleSave} submitting={submitting} apiError={error} onClearError={() => setError('')} />
    </div></main>
  )
}

export default NewPurchase
