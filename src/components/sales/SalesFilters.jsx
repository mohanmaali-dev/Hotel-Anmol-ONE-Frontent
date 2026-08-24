import { FiCalendar, FiFilter, FiSearch, FiX } from 'react-icons/fi'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

function SalesFilters({ filters, onChange, onClear }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <FiFilter className="text-primary" /> Filters
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_repeat(5,1fr)_auto]">
        <label className="relative">
          <span className="sr-only">Search sales</span>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Sale, bill, order, or customer"
            className={`${inputClass} pl-9`}
          />
        </label>

        <label className="relative">
          <span className="sr-only">From date</span>
          <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={filters.fromDate}
            onChange={(event) => onChange('fromDate', event.target.value)}
            aria-label="From date"
            title="From date"
            className={`${inputClass} pl-9`}
          />
        </label>

        <label className="relative">
          <span className="sr-only">To date</span>
          <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="date" value={filters.toDate} onChange={(event) => onChange('toDate', event.target.value)} aria-label="To date" title="To date" className={`${inputClass} pl-9`} />
        </label>

        <label>
          <span className="sr-only">Order type</span>
          <select
            value={filters.orderType}
            onChange={(event) => onChange('orderType', event.target.value)}
            className={inputClass}
          >
            <option value="">All order types</option>
            <option value="Dine In">Dine In</option>
            <option value="Parcel">Parcel</option>
            <option value="Room">Room</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Payment type</span>
          <select
            value={filters.paymentType}
            onChange={(event) => onChange('paymentType', event.target.value)}
            className={inputClass}
          >
            <option value="">All payment types</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Payment status</span>
          <select
            value={filters.paymentStatus}
            onChange={(event) => onChange('paymentStatus', event.target.value)}
            className={inputClass}
          >
            <option value="">All payment statuses</option>
            <option value="Paid">Paid</option>
            <option value="Not Paid">Not Paid</option>
            <option value="Partial">Partial</option>
          </select>
        </label>

        <button
          type="button"
          onClick={onClear}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <FiX /> Clear
        </button>
      </div>
    </section>
  )
}

export default SalesFilters
