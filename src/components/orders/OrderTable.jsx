import { useState } from 'react'
import { FiAlertTriangle, FiEye, FiFileText, FiInbox, FiPlusCircle, FiSlash, FiTrash2, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import ConfirmDeleteModal from '../ConfirmDeleteModal.jsx'
import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

const orderTypeClasses = {
  'Dine In': 'bg-blue-50 text-blue-700',
  Parcel: 'bg-amber-50 text-amber-700',
  Room: 'bg-violet-50 text-violet-700',
}

function OrderTable({
  orders,
  total,
  loading,
  hasFilters,
  canCreate,
  canEdit,
  canDelete,
  canViewBilling,
  canCreateBill,
  onCancel,
  onDelete,
  onGenerateBill,
}) {
  const [pendingAction, setPendingAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [generatingBillId, setGeneratingBillId] = useState('')

  const generateBill = async (order) => {
    if (generatingBillId) return
    setGeneratingBillId(order.id)
    try {
      await onGenerateBill(order)
    } finally {
      setGeneratingBillId('')
    }
  }

  const confirmAction = async () => {
    setActionLoading(true)
    try {
      if (pendingAction.type === 'delete') await onDelete(pendingAction.order)
      else await onCancel(pendingAction.order)
      setPendingAction(null)
    } catch {
      setPendingAction(null)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-bold text-slate-900">All Orders</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {loading && orders.length ? 'Updating orders...' : `${total} ${total === 1 ? 'order' : 'orders'} found`}
          </p>
        </div>
      </div>

      {pendingAction?.type === 'cancel' && (
        <div className="flex flex-col gap-3 border-b border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center">
          <FiAlertTriangle className="shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-amber-800">Cancel {pendingAction.order.orderNo}?</p><p className="mt-0.5 text-xs text-amber-700">The order will stay in history, but it cannot be edited or completed.</p></div>
          <div className="flex shrink-0 gap-2"><button type="button" disabled={actionLoading} onClick={() => setPendingAction(null)} className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"><FiX /> Keep Order</button><button type="button" disabled={actionLoading} onClick={confirmAction} className="flex h-9 items-center gap-1.5 rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"><FiSlash />{actionLoading ? 'Cancelling...' : 'Cancel Order'}</button></div>
        </div>
      )}

      {loading && !orders.length ? (
        <div className="grid place-items-center px-6 py-16">
          <span className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" />
          <p className="mt-3 text-sm text-slate-500">Loading orders...</p>
        </div>
      ) : orders.length ? (
        <div className={`overflow-x-auto transition-opacity ${loading ? 'pointer-events-none opacity-60' : ''}`} aria-busy={loading}>
          <table className="w-full min-w-[1780px] text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Order No.</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Order Type</th>
                <th className="px-4 py-3">Area Type</th>
                <th className="px-4 py-3">Area / Room No.</th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Additional Charges</th>
                <th className="px-4 py-3">Final Amount</th>
                <th className="px-4 py-3">Payment Type</th>
                <th className="px-4 py-3">Payment Status</th>
                <th className="px-4 py-3">Order Status</th>
                <th className="px-4 py-3">Biller</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="text-sm text-slate-600 hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-primary-dark">
                    <Link to={`/orders/${order.id}`} className="record-link" title="View order details">
                      #{order.orderNo}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{formatOrderDate(order.date, true)}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${orderTypeClasses[order.orderType]}`}
                    >
                      {order.orderType}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {order.areaType || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                    {order.areaRoomNo || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                    {order.customerName || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">
                    {formatCurrency(order.subtotal)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-rose-600">
                    {order.discount ? `-${formatCurrency(order.discount)}` : formatCurrency(0)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-amber-700">
                    {order.additionalCharges ? `+${formatCurrency(order.additionalCharges)}` : formatCurrency(0)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-bold text-slate-900">
                    {formatCurrency(order.finalAmount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{order.paymentType || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : order.paymentStatus === 'Partial'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-500'
                            : order.paymentStatus === 'Partial'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                      />
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${order.orderStatus === 'Cancelled' ? 'bg-slate-100 text-slate-600' : order.orderStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{order.orderStatus}</span></td>
                  <td className="whitespace-nowrap px-4 py-4">{order.billerName || (order.biller ? 'Assigned user' : '—')}</td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex justify-center gap-1.5"><Link to={`/orders/${order.id}`} aria-label={`View ${order.orderNo}`} title="View order" className="inline-grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-primary/30 hover:bg-primary-light hover:text-primary-dark"><FiEye /></Link>{canViewBilling && order.bill && <Link to={`/billing/${order.bill.id}`} aria-label={`View bill for ${order.orderNo}`} title={`View bill ${order.bill.billNo}`} className="inline-grid size-8 place-items-center rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"><FiFileText /></Link>}{canCreateBill && !order.bill && order.orderStatus !== 'Cancelled' && <button type="button" disabled={Boolean(generatingBillId)} onClick={() => generateBill(order)} aria-label={`Generate bill for ${order.orderNo}`} title="Generate bill" className="inline-grid size-8 place-items-center rounded-lg border border-primary/30 text-primary-dark hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50">{generatingBillId === order.id ? <span className="size-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" /> : <FiPlusCircle />}</button>}{canEdit && order.paymentStatus === 'Not Paid' && !order.bill && !['Cancelled', 'Completed'].includes(order.orderStatus) && <button type="button" onClick={() => setPendingAction({ type: 'cancel', order })} aria-label={`Cancel ${order.orderNo}`} title="Cancel order" className="inline-grid size-8 place-items-center rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50"><FiSlash /></button>}{canDelete && order.orderStatus !== 'Completed' && <button type="button" onClick={() => setPendingAction({ type: 'delete', order })} aria-label={`Delete ${order.orderNo}`} title="Permanently delete order" className="inline-grid size-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"><FiTrash2 /></button>}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid place-items-center px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-xl text-slate-400">
            <FiInbox />
          </span>
          <p className="mt-3 font-semibold text-slate-700">No orders found</p>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters
              ? 'Try changing or clearing the filters.'
              : canCreate
                ? 'Create your first order using the New Order button.'
                : 'Orders will appear here when they are created.'}
          </p>
        </div>
      )}
      <ConfirmDeleteModal open={pendingAction?.type === 'delete'} title={`Delete order ${pendingAction?.order?.orderNo || ''}?`} message="This order will be permanently removed. This action cannot be undone." dependencyType="order" recordId={pendingAction?.order?.id} confirmLabel="Delete Order" loading={actionLoading} onConfirm={confirmAction} onClose={() => setPendingAction(null)} />
    </section>
  )
}

export default OrderTable
