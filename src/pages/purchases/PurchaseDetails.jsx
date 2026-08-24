import { useEffect, useState } from 'react'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiEdit2,
  FiPackage,
  FiShoppingCart,
  FiSlash,
  FiTruck,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { deletePurchase, getPurchase, updatePurchasePayment, updatePurchaseStatus } from '../../api/purchaseApi.js'
import { getStockSummary } from '../../api/stockApi.js'
import { getSupplier } from '../../api/supplierApi.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'
import DangerZone from '../../components/DangerZone.jsx'
import Toast from '../../components/Toast.jsx'
import PurchasePayment from '../../components/purchases/PurchasePayment.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

const statusClasses = {
  Draft: 'bg-slate-100 text-slate-700',
  Ordered: 'bg-blue-50 text-blue-700',
  Received: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-rose-50 text-rose-700',
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  )
}

function PurchaseDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { can } = useAuth()
  const [purchase, setPurchase] = useState(null)
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(location.state?.message || '')
  const [paymentDraft, setPaymentDraft] = useState({
    paymentType: 'Cash',
    paidAmount: 0,
  })

  useEffect(() => {
    let active = true
    getPurchase(id)
      .then(async (result) => {
        if (!active) return
        setPurchase(result.data)
        setPaymentDraft({ paymentType: result.data.paymentType || 'Cash', paidAmount: result.data.paidAmount })
        try {
          const supplierResult = await getSupplier(result.data.supplierId, 1)
          if (active) setSupplier(supplierResult.data)
        } catch {
          if (active) setSupplier(null)
        }
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  const applyPurchase = (value) => {
    setPurchase(value)
    setPaymentDraft({ paymentType: value.paymentType || 'Cash', paidAmount: value.paidAmount })
  }

  const handleStatusUpdate = async (status) => {
    if (updating) return
    setUpdating(true)
    setError('')
    try {
      const result = await updatePurchaseStatus(purchase.id, status)
      const refreshed = await getPurchase(purchase.id)
      applyPurchase(refreshed.data)
      if (status === 'Received') {
        const stockResult = await getStockSummary().catch(() => null)
        setMessage(stockResult ? `${result.message} Stock now has ${stockResult.data.totalStockItems} items.` : `${result.message} Stock quantities were updated.`)
      } else setMessage(result.message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdating(false)
    }
  }

  const handlePaymentUpdate = async () => {
    if (updating) return
    setUpdating(true)
    setError('')
    try {
      const result = await updatePurchasePayment(purchase.id, paymentDraft)
      applyPurchase(result.data)
      setMessage(result.message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    setUpdating(true)
    try {
      const result = await deletePurchase(purchase.id)
      navigate('/purchases', { replace: true, state: { message: result.message } })
    } catch (requestError) {
      setError(requestError.message)
      setUpdating(false)
      setConfirmDelete(false)
    }
  }

  if (loading) return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="text-center"><span className="mx-auto block size-10 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading purchase...</p></div></main>

  if (!purchase) {
    return (
      <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12">
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-2xl text-slate-400">
            <FiPackage />
          </span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Purchase not found</h2>
          <p className="mt-1 text-sm text-slate-500">{error || 'This purchase may have been removed.'}</p>
          <Link
            to="/purchases"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <FiArrowLeft /> Back to Purchases
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="page-content">
        <Toast message={message} type="success" onClose={() => setMessage('')} />
        {error && <div className="mb-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"><FiPackage className="mt-0.5 shrink-0" /><span className="flex-1">{error}</span><button type="button" onClick={() => setError('')} aria-label="Close purchase error" className="grid size-6 place-items-center rounded-md hover:bg-rose-100"><FiX /></button></div>}

        <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <Link
              to="/purchases"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"
            >
              <FiArrowLeft /> Back to Purchases
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                #{purchase.purchaseNo}
              </h2>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[purchase.purchaseStatus]}`}>
                {purchase.purchaseStatus}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Purchase dated {formatOrderDate(purchase.purchaseDate)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {can('purchases', 'edit') && !['Received', 'Cancelled'].includes(purchase.purchaseStatus) && <Link
              to={`/purchases/new?edit=${purchase.id}`}
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
            >
              <FiEdit2 /> Edit Purchase
            </Link>}
            {can('purchases', 'edit') && purchase.purchaseStatus === 'Draft' && <button type="button" disabled={updating} onClick={() => handleStatusUpdate('Ordered')} className="flex h-10 items-center gap-2 rounded-lg border border-blue-200 bg-white px-3.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"><FiShoppingCart /> Mark as Ordered</button>}
            {can('purchases', 'edit') && <button
              type="button"
              onClick={() => handleStatusUpdate('Received')}
              disabled={updating || purchase.purchaseStatus === 'Received' || purchase.purchaseStatus === 'Cancelled'}
              className="flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiTruck /> Mark as Received
            </button>}
            {can('purchases', 'edit') && <button
              type="button"
              onClick={() => handleStatusUpdate('Cancelled')}
              disabled={updating || ['Received', 'Cancelled'].includes(purchase.purchaseStatus)}
              className="flex h-10 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiSlash /> Cancel Purchase
            </button>}
          </div>
        </div>

        {purchase.purchaseStatus === 'Received' && purchase.stockUpdated && <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><FiCheckCircle className="mt-0.5 shrink-0" /><div><p className="font-semibold">Stock Updated</p><p className="mt-0.5 text-xs text-emerald-700">Purchased items have been added to stock.</p></div></div>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <h3 className="font-bold text-slate-900">Supplier Details</h3>
            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6">
              <DetailItem label="Supplier" value={supplier?.name || purchase.supplierName} />
              <DetailItem label="Contact Person" value={supplier?.contactPerson} />
              <DetailItem label="Phone" value={supplier?.phone} />
              <DetailItem label="Email" value={supplier?.email} />
              <div className="col-span-2">
                <DetailItem label="Address" value={supplier?.address} />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
            <h3 className="font-bold text-slate-900">Purchase Information</h3>
            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6">
              <DetailItem label="Purchase No." value={`#${purchase.purchaseNo}`} />
              <DetailItem label="Invoice No." value={purchase.invoiceNo} />
              <DetailItem label="Purchase Date" value={formatOrderDate(purchase.purchaseDate)} />
              <DetailItem label="Status" value={purchase.purchaseStatus} />
              <div className="col-span-2">
                <DetailItem label="Notes" value={purchase.notes} />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-bold text-slate-900">Purchased Items</h3>
              <p className="mt-0.5 text-xs text-slate-500">{purchase.totalItems} total units</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Item Name</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3 text-right">Purchase Price</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchase.items.map((item, index) => (
                    <tr key={`${item.itemId}-${index}`} className="text-sm text-slate-600">
                      <td className="px-5 py-4 font-semibold text-slate-800">{item.name}</td>
                      <td className="px-4 py-4 text-center">{item.quantity}</td>
                      <td className="px-4 py-4">{item.unit}</td>
                      <td className="px-4 py-4 text-right">{formatCurrency(item.purchasePrice)}</td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-800">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
              <h3 className="font-bold text-slate-900">Final Totals</h3>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(purchase.subtotal)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-semibold text-emerald-700">- {formatCurrency(purchase.discount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Additional Charges</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(purchase.additionalCharges)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-t border-dashed border-slate-200 pt-3">
                  <span className="font-bold text-slate-900">Final Amount</span>
                  <span className="text-lg font-bold text-primary-dark">
                    {formatCurrency(purchase.finalAmount)}
                  </span>
                </div>
              </div>
            </section>

            <PurchasePayment
              paymentType={paymentDraft.paymentType}
              paidAmount={paymentDraft.paidAmount}
              finalAmount={purchase.finalAmount}
              onChange={(field, value) =>
                setPaymentDraft((current) => ({ ...current, [field]: value }))
              }
              onUpdate={handlePaymentUpdate}
              paymentStatus={purchase.paymentStatus}
              dueAmount={purchase.dueAmount}
              updating={updating}
              disabled={!can('purchases', 'edit') || purchase.purchaseStatus === 'Cancelled'}
            />
          </div>
        </div>

        {can('purchases', 'delete') && ['Draft', 'Cancelled'].includes(purchase.purchaseStatus) && (
          <DangerZone
            title="Delete this purchase"
            description="Permanently remove this draft or cancelled purchase. Received purchases cannot be deleted because they have already affected stock."
          >
            <button type="button" disabled={updating} onClick={() => setConfirmDelete(true)} className="flex h-9 items-center gap-1.5 rounded-md border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"><FiTrash2 /> Delete Purchase</button>
          </DangerZone>
        )}
        <ConfirmDeleteModal open={confirmDelete} title={`Delete purchase ${purchase.purchaseNo}?`} message="This draft or cancelled purchase will be permanently removed. This action cannot be undone." confirmLabel="Delete Purchase" loading={updating} onConfirm={handleDelete} onClose={() => setConfirmDelete(false)} />
      </div>
    </main>
  )
}

export default PurchaseDetails
