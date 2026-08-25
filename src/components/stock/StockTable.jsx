import { FiArrowDown, FiArrowUp, FiClock, FiEdit2, FiPackage, FiPower, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { formatCurrency } from '../../utils/orderFormatters.js'

const statusClasses = {
  'In Stock': 'bg-emerald-50 text-emerald-700',
  'Low Stock': 'bg-amber-50 text-amber-700',
  'Out of Stock': 'bg-rose-50 text-rose-700',
}

function StockTable({ items, total, loading, canEdit, canDelete, onStockIn, onStockOut, onToggleActive, onDelete }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-900">Stock Items</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {total} {total === 1 ? 'item' : 'items'} found
        </p>
      </div>

      {loading ? (
        <div className="grid place-items-center px-6 py-16"><span className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading stock...</p></div>
      ) : items.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Current Quantity</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-right">Purchase Price</th>
                <th className="px-4 py-3 text-right">Stock Value</th>
                <th className="px-4 py-3 text-right">Minimum Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="text-sm text-slate-600 hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                    <Link to={`/stock/history?item=${item.id}`} className="record-link" title="View stock history">
                      {item.name}
                    </Link>
                    {!item.isActive && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Inactive</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{item.category}</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-800">
                    {item.currentQuantity}
                  </td>
                  <td className="px-4 py-4">{item.unit}</td>
                  <td className="px-4 py-4 text-right"><p>{formatCurrency(item.purchasePrice)}</p><p className="mt-0.5 text-xs text-slate-400">per {item.unit}</p></td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-800">
                    {formatCurrency(item.stockValue)}
                  </td>
                  <td className="px-4 py-4 text-right">{item.minimumStock}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {canEdit && item.isActive && <button
                        type="button"
                        onClick={() => onStockIn(item.id)}
                        aria-label={`Stock in ${item.name}`}
                        title="Stock In"
                        className="grid size-8 place-items-center rounded-lg border border-slate-200 text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50"
                      >
                        <FiArrowDown />
                      </button>}
                      {canEdit && item.isActive && <button
                        type="button"
                        onClick={() => onStockOut(item.id)}
                        aria-label={`Stock out ${item.name}`}
                        title="Stock Out"
                        className="grid size-8 place-items-center rounded-lg border border-slate-200 text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                      >
                        <FiArrowUp />
                      </button>}
                      <Link
                        to={`/stock/history?item=${item.id}`}
                        aria-label={`View ${item.name} history`}
                        title="View History"
                        className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                      >
                        <FiClock />
                      </Link>
                      {canDelete && <button type="button" onClick={() => onDelete(item)} aria-label={`Delete ${item.name}`} title="Delete Item" className="grid size-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"><FiTrash2 /></button>}
                      {canEdit && <Link
                        to={`/stock/items?edit=${item.id}`}
                        aria-label={`Edit ${item.name}`}
                        title="Edit Item"
                        className="grid size-8 place-items-center rounded-lg border border-slate-200 text-primary-dark hover:bg-primary-light"
                      >
                        <FiEdit2 />
                      </Link>}
                      {canEdit && <button type="button" onClick={() => onToggleActive(item)} aria-label={`${item.isActive ? 'Deactivate' : 'Activate'} ${item.name}`} title={item.isActive ? 'Make Inactive' : 'Make Active'} className={`grid size-8 place-items-center rounded-lg border ${item.isActive ? 'border-slate-200 text-slate-500 hover:bg-slate-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}><FiPower /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid place-items-center px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-xl text-slate-400">
            <FiPackage />
          </span>
          <p className="mt-3 font-semibold text-slate-700">No stock items found</p>
          <p className="mt-1 text-sm text-slate-500">Try changing or clearing the filters.</p>
        </div>
      )}
    </section>
  )
}

export default StockTable
