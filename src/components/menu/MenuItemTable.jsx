import { FiEdit2, FiEye, FiPower, FiTag, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { isMenuItemAvailable } from '../../api/menuApi.js'
import { formatCurrency } from '../../utils/orderFormatters.js'

function MenuItemTable({ items, categories, onToggleAvailability, onDelete, total = items.length, loading = false, canEdit = true, canDelete = false }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-bold text-slate-900">Menu Items</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {total} {total === 1 ? 'item' : 'items'} found
        </p>
      </div>

      {loading ? (
        <div className="grid place-items-center px-6 py-14"><span className="size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" /><p className="mt-3 text-sm text-slate-500">Loading menu items...</p></div>
      ) : items.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Selling Price</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Stock Tracking</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const category = item.category || categories.find((entry) => entry.id === item.categoryId)
                const available = isMenuItemAvailable(item, categories)
                return (
                  <tr key={item.id} className="text-sm text-slate-600 hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                      <Link to={`/menu/items/${item.id}`} className="record-link" title="View menu item details">
                        {item.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">{category?.name || 'Uncategorized'}</td>
                    <td className="px-4 py-4 text-right font-bold text-slate-800">
                      {formatCurrency(item.sellingPrice)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          available
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {available ? 'Available' : 'Unavailable'}
                      </span>
                      {!category?.isActive && (
                        <span className="ml-2 text-[11px] text-slate-400">Category disabled</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.trackStock
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.trackStock ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          to={`/menu/items/${item.id}`}
                          aria-label={`View ${item.name}`}
                          title="View item"
                          className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        >
                          <FiEye />
                        </Link>
                        {canEdit && <Link
                          to={`/menu/items/new?edit=${item.id}`}
                          aria-label={`Edit ${item.name}`}
                          title="Edit item"
                          className="grid size-8 place-items-center rounded-lg border border-slate-200 text-primary-dark hover:bg-primary-light"
                        >
                          <FiEdit2 />
                        </Link>}
                        {canEdit && <button
                          type="button"
                          onClick={() => onToggleAvailability(item.id)}
                          aria-label={`${item.isAvailable ? 'Disable' : 'Enable'} ${item.name}`}
                          title={item.isAvailable ? 'Make unavailable' : 'Make available'}
                          className={`grid size-8 place-items-center rounded-lg border ${
                            item.isAvailable
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <FiPower />
                        </button>}
                        {canDelete && <button type="button" onClick={() => onDelete(item)} aria-label={`Delete ${item.name}`} title="Delete item" className="grid size-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"><FiTrash2 /></button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid place-items-center px-6 py-14 text-center">
          <FiTag className="text-2xl text-slate-400" />
          <p className="mt-3 font-semibold text-slate-700">No menu items found</p>
          <p className="mt-1 text-sm text-slate-500">Try changing or clearing the filters.</p>
        </div>
      )}
    </section>
  )
}

export default MenuItemTable
