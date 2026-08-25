import { FiEye, FiTrash2, FiTruck } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { formatCurrency } from '../../utils/orderFormatters.js'

function SupplierTable({ suppliers, total = suppliers.length, loading = false, canDelete = false, onDelete }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-900">All Suppliers</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {total} {total === 1 ? 'supplier' : 'suppliers'} found
        </p>
      </div>

      {loading ? (
        <div className="grid place-items-center px-6 py-16"><span className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading suppliers...</p></div>
      ) : suppliers.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Supplier Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-center">Total Purchases</th>
                <th className="px-4 py-3 text-right">Paid Amount</th>
                <th className="px-4 py-3 text-right">Due Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="text-sm text-slate-600 hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                    <Link to={`/suppliers/${supplier.id}`} className="record-link" title="View supplier details">
                      {supplier.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{supplier.phone}</td>
                  <td className="whitespace-nowrap px-4 py-4">{supplier.email || '—'}</td>
                  <td className="px-4 py-4 text-center font-semibold text-slate-800">
                    {supplier.totalPurchases}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-emerald-700">
                    {formatCurrency(supplier.totalPaid)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-rose-700">
                    {formatCurrency(supplier.totalDue)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        supplier.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        to={`/suppliers/${supplier.id}`}
                        aria-label={`View ${supplier.name}`}
                        title="View supplier"
                        className="inline-grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-primary/30 hover:bg-primary-light hover:text-primary-dark"
                      >
                        <FiEye />
                      </Link>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete?.(supplier)}
                          aria-label={`Delete ${supplier.name}`}
                          title="Delete supplier"
                          className="inline-grid size-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid place-items-center px-6 py-16 text-center">
          <FiTruck className="text-2xl text-slate-400" />
          <p className="mt-3 font-semibold text-slate-700">No suppliers found</p>
          <p className="mt-1 text-sm text-slate-500">Try changing or clearing the filters.</p>
        </div>
      )}
    </section>
  )
}

export default SupplierTable
