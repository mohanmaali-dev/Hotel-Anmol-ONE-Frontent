import { useState } from 'react'
import { FiAlertTriangle, FiEye, FiInbox, FiSlash, FiTrash2, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import ConfirmDeleteModal from '../ConfirmDeleteModal.jsx'
import { formatCurrency, formatOrderDate } from '../../utils/orderFormatters.js'

const orderTypeClasses = {
  'Dine In': 'bg-blue-50 text-blue-700',
  Parcel: 'bg-amber-50 text-amber-700',
  Room: 'bg-violet-50 text-violet-700',
}

function OrderTable({ orders, total, loading, canEdit, canDelete, onCancel, onDelete }) {
  const [pendingAction, setPendingAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

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
            {total} {total === 1 ? 'order' : 'orders'} found
          </p>
        </div>
      </div>

      {pendingAction?.type === 'cancel' && (
        <div className={`flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center ${pendingAction.type === 'delete' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}>
          <FiAlertTriangle className={`shrink-0 ${pendingAction.type === 'delete' ? 'text-rose-600' : 'text-amber-600'}`} />
          <div className="min-w-0 flex-1"><p className={`text-sm font-semibold ${pendingAction.type === 'delete' ? 'text-rose-800' : 'text-amber-800'}`}>{pendingAction.type === 'delete' ? `Permanently delete ${pendingAction.order.orderNo}?` : `Cancel ${pendingAction.order.orderNo}?`}</p><p className={`mt-0.5 text-xs ${pendingAction.type === 'delete' ? 'text-rose-600' : 'text-amber-700'}`}>{pendingAction.type === 'delete' ? 'This removes the complete order and its related frontend bill and sale. This cannot be undone.' : 'The order stays available for billing, sales, and reporting records.'}</p></div>
          <div className="flex shrink-0 gap-2"><button type="button" disabled={actionLoading} onClick={() => setPendingAction(null)} className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"><FiX /> Keep Order</button><button type="button" disabled={actionLoading} onClick={confirmAction} className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white disabled:opacity-60 ${pendingAction.type === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}>{pendingAction.type === 'delete' ? <FiTrash2 /> : <FiSlash />}{actionLoading ? 'Working...' : pendingAction.type === 'delete' ? 'Delete Permanently' : 'Cancel Order'}</button></div>
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center px-6 py-16">
          <span className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" />
          <p className="mt-3 text-sm text-slate-500">Loading orders...</p>
        </div>
      ) : orders.length ? (
        <div className="overflow-x-auto">
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
                  <td className="whitespace-nowrap px-4 py-4">{formatOrderDate(order.date)}</td>
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
                    {order.customerName}
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
                  <td className="whitespace-nowrap px-4 py-4">{order.paymentType}</td>
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
                    <div className="flex justify-center gap-1.5"><Link to={`/orders/${order.id}`} aria-label={`View ${order.orderNo}`} title="View order" className="inline-grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-primary/30 hover:bg-primary-light hover:text-primary-dark"><FiEye /></Link>{canEdit && !['Cancelled', 'Completed'].includes(order.orderStatus) && <button type="button" onClick={() => setPendingAction({ type: 'cancel', order })} aria-label={`Cancel ${order.orderNo}`} title="Cancel order" className="inline-grid size-8 place-items-center rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50"><FiSlash /></button>}{canDelete && order.orderStatus !== 'Completed' && <button type="button" onClick={() => setPendingAction({ type: 'delete', order })} aria-label={`Delete ${order.orderNo}`} title="Permanently delete order" className="inline-grid size-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"><FiTrash2 /></button>}</div>
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
          <p className="mt-1 text-sm text-slate-500">Try changing or clearing the filters.</p>
        </div>
      )}
      <ConfirmDeleteModal open={pendingAction?.type === 'delete'} title={`Delete order ${pendingAction?.order?.orderNo || ''}?`} message="This order will be permanently removed. This action cannot be undone." dependencyType="order" recordId={pendingAction?.order?.id} confirmLabel="Delete Order" loading={actionLoading} onConfirm={confirmAction} onClose={() => setPendingAction(null)} />
    </section>
  )
}

export default OrderTable
