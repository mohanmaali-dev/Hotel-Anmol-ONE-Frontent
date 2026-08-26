import { FiAlertTriangle, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

function LowStock({ items, loading, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
        <div>
          <h2 className="font-bold text-slate-900">Stock Alerts</h2>
          <p className="mt-0.5 text-xs text-slate-500">Low and out-of-stock items</p>
        </div>
        <span className="grid size-9 place-items-center rounded-lg bg-rose-50 text-rose-600">
          <FiAlertTriangle />
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[390px] text-left">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Item Name</th>
              <th className="px-2 py-3">Current Stock</th>
              <th className="px-2 py-3">Unit</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && items.map((item) => (
              <tr key={item.id || item.itemName} className="text-sm hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                  {item.id ? <Link to={`/stock/history?item=${item.id}`} className="record-link" title="View stock history">{item.itemName}</Link> : item.itemName}
                </td>
                <td className="px-2 py-4 font-semibold text-slate-700">{item.currentStock}</td>
                <td className="px-2 py-4 text-slate-500">{item.unit}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.status === 'Out of Stock'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {loading && <tr><td colSpan="4" className="px-5 py-12 text-center text-sm text-slate-500">Loading stock...</td></tr>}
            {!loading && !items.length && <tr><td colSpan="4" className="px-5 py-12 text-center text-sm text-slate-500">Stock levels are healthy.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 px-5 py-3.5">
        <Link
          to="/stock"
          className="flex items-center gap-1.5 text-sm font-semibold text-primary-dark hover:text-primary"
        >
          View stock inventory <FiArrowRight />
        </Link>
      </div>
    </section>
  )
}

export default LowStock
