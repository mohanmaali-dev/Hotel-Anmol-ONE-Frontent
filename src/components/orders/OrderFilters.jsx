import { FiSearch, FiX } from 'react-icons/fi'

import DatePickerField from '../DatePickerField.jsx'
import MobileFilterPanel from '../MobileFilterPanel.jsx'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

function OrderFilters({ filters, onChange, onClear }) {
  return (
    <MobileFilterPanel filters={filters}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[2fr_1fr_1fr_1fr_1.2fr_auto]">
        <label className="relative">
          <span className="sr-only">Search by order number or customer</span>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Order No. or customer"
            className={`${inputClass} pl-9`}
          />
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
          <span className="sr-only">Payment status</span>
          <select
            value={filters.paymentStatus}
            onChange={(event) => onChange('paymentStatus', event.target.value)}
            className={inputClass}
          >
            <option value="">All payment statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Not Paid">Not Paid</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Order status</span>
          <select
            value={filters.orderStatus}
            onChange={(event) => onChange('orderStatus', event.target.value)}
            className={inputClass}
          >
            <option value="">All order statuses</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </label>

        <DatePickerField label="Date" value={filters.date} onChange={(value) => onChange('date', value)} />

        <button
          type="button"
          onClick={onClear}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <FiX /> Clear
        </button>
      </div>
    </MobileFilterPanel>
  )
}

export default OrderFilters
