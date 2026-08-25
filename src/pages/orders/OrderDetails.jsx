import { useEffect, useState } from 'react'
import { FiAlertCircle, FiArrowLeft, FiFileText, FiPrinter, FiShoppingBag, FiTrash2, FiX } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { findBillForOrder, generateBillFromOrder } from '../../api/billingApi.js'
import { deleteOrder, getOrder, updateOrder } from '../../api/orderApi.js'
import { getStockSummary } from '../../api/stockApi.js'
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal.jsx'
import DangerZone from '../../components/DangerZone.jsx'
import Toast from '../../components/Toast.jsx'
import PrintableOrder from '../../components/orders/PrintableOrder.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSettings } from '../../context/SettingsContext.jsx'
import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

const statuses = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled']

function DetailItem({ label, value }) {
  return <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1.5 text-sm font-semibold text-slate-800">{value || '—'}</p></div>
}

function OrderDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, can } = useAuth()
  const { settings } = useSettings()
  const canViewBilling = can('billing', 'view')
  const [order, setOrder] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('Pending')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingBill, setGeneratingBill] = useState(false)
  const [checkingBill, setCheckingBill] = useState(true)
  const [existingBill, setExistingBill] = useState(null)
  const [error, setError] = useState('')
  const [stockIssues, setStockIssues] = useState([])
  const [message, setMessage] = useState(location.state?.message || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getOrder(id)
      .then((result) => {
        if (!active) return
        setOrder(result.data)
        setSelectedStatus(result.data.orderStatus)
        if (!canViewBilling) {
          setCheckingBill(false)
          return
        }
        findBillForOrder(result.data.orderNo)
          .then((bill) => { if (active) setExistingBill(bill) })
          .catch(() => {})
          .finally(() => { if (active) setCheckingBill(false) })
      })
      .catch((requestError) => { if (active) { setError(requestError.message); setCheckingBill(false) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [canViewBilling, id])

  const handleStatusUpdate = async () => {
    if (saving || selectedStatus === order.orderStatus) return
    setSaving(true)
    setError('')
    setStockIssues([])
    try {
      const result = await updateOrder(order.id, { orderStatus: selectedStatus })
      const refreshed = await getOrder(order.id)
      setOrder(refreshed.data)
      setSelectedStatus(refreshed.data.orderStatus)
      if (selectedStatus === 'Completed') await getStockSummary().catch(() => null)
      setMessage(result.message || 'Order status updated successfully.')
    } catch (requestError) {
      setSelectedStatus(order.orderStatus)
      if (selectedStatus === 'Completed' && requestError.items?.length) {
        setError('Order cannot be completed. Some ingredients do not have enough stock.')
        setStockIssues(requestError.items)
      } else setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    setError('')
    try {
      const result = await deleteOrder(order.id)
      navigate('/orders', { replace: true, state: { message: result.message || `${order.orderNo} was deleted.` } })
    } catch (requestError) {
      setError(requestError.message)
      setConfirmDelete(false)
      setSaving(false)
    }
  }

  const handleGenerateBill = async () => {
    if (generatingBill) return
    setGeneratingBill(true)
    setError('')
    try {
      const result = await generateBillFromOrder(order.id)
      setExistingBill(result.data)
      navigate(`/billing/${result.data.id}`, {
        state: { message: result.message || 'Bill generated successfully.' },
      })
    } catch (requestError) {
      if (requestError.status === 409) {
        try {
          const existingBill = await findBillForOrder(order.orderNo)
          if (existingBill) {
            navigate(`/billing/${existingBill.id}`, {
              state: { message: 'A bill already exists for this order.' },
            })
            return
          }
        } catch {
          // Show the original duplicate response if the existing bill cannot be read.
        }
      }
      setError(requestError.message)
    } finally {
      setGeneratingBill(false)
    }
  }

  if (loading) {
    return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="text-center"><span className="mx-auto block size-10 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading order...</p></div></main>
  }

  if (!order) {
    return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-4 py-12"><div className="max-w-md text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-2xl text-slate-400"><FiShoppingBag /></span><h2 className="mt-4 text-xl font-bold text-slate-900">Order not found</h2><p className="mt-1 text-sm text-slate-500">{error || 'This order may have been removed or does not exist.'}</p><Link to="/orders" className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiArrowLeft /> Back to Orders</Link></div></main>
  }

  const locked = ['Completed', 'Cancelled'].includes(order.orderStatus)
  const billerName = order.billerName || (String(order.biller) === String(user?._id) ? user?.name : order.biller ? 'Assigned user' : '—')

  return (
    <main className="print-area px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="page-content">
        <Toast message={message} type="success" onClose={() => setMessage('')} />
        <div className="print:hidden">
        {error && <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><div className="flex items-start gap-2 font-medium"><FiAlertCircle className="mt-0.5 shrink-0" /><span className="flex-1">{error}</span><button type="button" onClick={() => { setError(''); setStockIssues([]) }} aria-label="Close order error" className="grid size-6 shrink-0 place-items-center rounded-md hover:bg-rose-100"><FiX /></button></div>{stockIssues.length > 0 && <div className="mt-3 overflow-x-auto rounded-lg border border-rose-200 bg-white"><table className="w-full min-w-[480px] text-left"><thead><tr className="text-xs font-semibold uppercase tracking-wide text-rose-600"><th className="px-3 py-2">Ingredient</th><th className="px-3 py-2 text-right">Required</th><th className="px-3 py-2 text-right">Available</th></tr></thead><tbody className="divide-y divide-rose-100">{stockIssues.map((issue) => <tr key={issue.item}><td className="px-3 py-2 font-semibold text-slate-800">{issue.item}</td><td className="px-3 py-2 text-right">{issue.required} {issue.unit}</td><td className="px-3 py-2 text-right font-semibold text-rose-700">{issue.available} {issue.unit}</td></tr>)}</tbody></table></div>}</div>}

        <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-dark"><FiArrowLeft /> Back to Orders</Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">#{order.orderNo}</h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : order.paymentStatus === 'Partial' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}><span className={`size-1.5 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-emerald-500' : order.paymentStatus === 'Partial' ? 'bg-amber-500' : 'bg-rose-500'}`} />{order.paymentStatus}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Created {formatOrderDate(order.date, true)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {existingBill && canViewBilling ? <Link to={`/billing/${existingBill.id}`} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"><FiFileText /> View Bill</Link> : can('billing', 'create') && <button type="button" disabled={checkingBill || generatingBill} onClick={handleGenerateBill} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"><FiFileText /> {checkingBill ? 'Checking Bill...' : generatingBill ? 'Generating...' : 'Generate Bill'}</button>}
            <button type="button" onClick={() => window.print()} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"><FiPrinter /> Print Order</button>
          </div>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <div><h3 className="font-bold text-slate-900">Order Information</h3><p className="mt-0.5 text-xs text-slate-500">Customer and service details</p></div>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 xl:grid-cols-7">
            <DetailItem label="Order Type" value={order.orderType} /><DetailItem label="Area Type" value={order.areaType} /><DetailItem label="Area / Room No." value={order.areaRoomNo} /><DetailItem label="Customer" value={order.customerName} /><DetailItem label="Biller" value={billerName} /><DetailItem label="Order Date" value={formatOrderDate(order.date)} /><DetailItem label="Order Status" value={order.orderStatus} />
          </div>
        </section>

        {can('orders', 'edit') && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
            <div>
              <h3 className="font-bold text-slate-900">Update Order Status</h3>
              <p className="mt-1 text-sm text-slate-500">
                {locked
                  ? `This order is ${order.orderStatus.toLowerCase()} and its status is locked.`
                  : 'Choose the next stage for this order. Completing the order will update ingredient stock.'}
              </p>
            </div>
            {!locked && (
              <div className="mt-4 flex w-full flex-col gap-2 sm:mt-0 sm:w-auto sm:flex-row">
                <select value={selectedStatus} onChange={(event) => { setSelectedStatus(event.target.value); setError(''); setStockIssues([]) }} disabled={saving} aria-label="Order status" className="h-10 min-w-48 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">{statuses.map((status) => <option key={status}>{status}</option>)}</select>
                <button type="button" disabled={saving || selectedStatus === order.orderStatus} onClick={handleStatusUpdate} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Updating...' : 'Update Status'}</button>
              </div>
            )}
          </section>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
            <div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold text-slate-900">Order Items</h3><p className="mt-0.5 text-xs text-slate-500">{order.items.length} menu items</p></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead><tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">Item Name</th><th className="px-4 py-3 text-center">Quantity</th><th className="px-4 py-3 text-right">Rate</th><th className="px-5 py-3 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{order.items.map((item, index) => <tr key={item.id || `${item.menuItemId}-${index}`} className="text-sm text-slate-600"><td className="px-5 py-4"><p className="font-semibold text-slate-800">{item.name}</p>{item.servingSize && <p className="mt-0.5 text-xs text-slate-500">{item.servingSize}</p>}</td><td className="px-4 py-4 text-center">{item.quantity}</td><td className="px-4 py-4 text-right">{formatCurrency(item.rate)}</td><td className="px-5 py-4 text-right font-semibold text-slate-800">{formatCurrency(item.amount)}</td></tr>)}</tbody></table></div>
          </section>

          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40"><h3 className="font-bold text-slate-900">Billing Summary</h3><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><span className="text-slate-500">Subtotal</span><span className="font-semibold text-slate-800">{formatCurrency(order.subtotal)}</span></div><div className="flex justify-between gap-4"><span className="text-slate-500">Discount</span><span className="font-semibold text-emerald-700">- {formatCurrency(order.discount)}</span></div><div className="flex justify-between gap-4"><span className="text-slate-500">Additional Charges</span><span className="font-semibold text-slate-800">{formatCurrency(order.additionalCharges)}</span></div><div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-4"><span className="font-bold text-slate-900">Final Amount</span><span className="text-xl font-bold text-primary-dark">{formatCurrency(order.finalAmount)}</span></div></div></section>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40"><h3 className="font-bold text-slate-900">Payment Information</h3><div className="mt-4 grid grid-cols-2 gap-4"><DetailItem label="Payment Type" value={order.paymentType} /><DetailItem label="Status" value={order.paymentStatus} /></div></section>
          </div>
        </div>

        {can('orders', 'delete') && order.orderStatus !== 'Completed' && (
          <DangerZone
            title="Delete this order"
            description="Permanently remove this order. This action cannot be undone and may be blocked when related business records exist."
          >
            <button type="button" onClick={() => setConfirmDelete(true)} className="flex h-9 items-center gap-1.5 rounded-md border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100"><FiTrash2 /> Delete Order</button>
          </DangerZone>
        )}
        <ConfirmDeleteModal open={confirmDelete} title={`Delete order ${order.orderNo}?`} message="This will permanently remove the order. This action cannot be undone." dependencyType="order" recordId={order.id} confirmLabel="Delete Order" loading={saving} onConfirm={handleDelete} onClose={() => setConfirmDelete(false)} />
        </div>
        <PrintableOrder order={order} billerName={billerName} settings={settings} />
      </div>
    </main>
  )
}

export default OrderDetails
